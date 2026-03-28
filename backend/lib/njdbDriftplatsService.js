const fs = require('fs');
const path = require('path');

const NJDB_SEARCH_URL = 'https://njdbwebb.trafikverket.se/api/NetDb/Search';
const NJDB_INFO_CLICK_MULTIPLE_URL = 'https://njdbwebb.trafikverket.se/api/NetDb/InfoClickMultiple';
const DRIFTPLATS_DATA_PATH = path.join(__dirname, '..', 'data', 'njdb-driftplatser.json');
const SIGNAL_META_KEY = 'BIS_DK:Signal (främst ATC):1';
const DISPLAY_CODE_OVERRIDES = {
  Billeberga: 'Blb',
};

const MAX_NEIGHBORS = 4;
const MAX_NEIGHBOR_DISTANCE = 20000;
const MAX_INSERTION_RATIO = 1.08;
const MAX_INSERTION_DISTANCE = 4000;
const MIN_INSERTION_DISTANCE = 1200;
const MIN_ENDPOINT_GAP = 1500;
const MIN_SEGMENT_LENGTH = 3500;
const MAX_RECURSION_DEPTH = 8;
const SIGNAL_SEARCH_RADIUS = 3500;
const LOCAL_SIGNAL_DISTANCE_LIMIT = 1800;

let cachedDriftplatser = null;
const stationSignalCache = new Map();

const normalizeDriftplatsName = (value = '') =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();

const parsePointWkt = (wkt = '') => {
  const match = String(wkt || '').match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/i);
  if (!match) {
    return null;
  }

  return {
    x: Number(match[1]),
    y: Number(match[2]),
  };
};

const parseSignalWkt = (wktJson = '') => {
  try {
    const parsed = JSON.parse(String(wktJson || ''));
    return parsePointWkt(parsed?.Geom || '');
  } catch (error) {
    return null;
  }
};

const isOperationalPointKind = (kind = '') => {
  const normalized = String(kind || '').trim().toLowerCase();
  return normalized === 'driftplats' || normalized.startsWith('driftplats som innehåller');
};

const createPointRecord = ({ name = '', code = '', kind = '', x = 0, y = 0 }) => ({
  name: String(name || '').trim(),
  code: DISPLAY_CODE_OVERRIDES[String(name || '').trim()] || String(code || '').trim(),
  kind: String(kind || '').trim(),
  x: Number(x),
  y: Number(y),
});

const loadCachedDriftplatser = () => {
  if (cachedDriftplatser) {
    return cachedDriftplatser;
  }

  const raw = fs.readFileSync(DRIFTPLATS_DATA_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  cachedDriftplatser = Array.isArray(parsed?.items)
    ? parsed.items
        .map((item) => createPointRecord(item))
        .filter((item) => item.name && Number.isFinite(item.x) && Number.isFinite(item.y))
    : [];

  return cachedDriftplatser;
};

const distanceBetween = (left, right) =>
  Math.hypot(Number(right.x) - Number(left.x), Number(right.y) - Number(left.y));

const normalizeBoundaryToken = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();

const compactBoundaryToken = (value = '') => {
  const normalized = normalizeBoundaryToken(value);
  if (!normalized) {
    return '';
  }

  const compactDirect = normalized.replace(/([A-Za-zÅÄÖåäö]+)\s+(\d+)/g, '$1$2');
  const prefixMatch = compactDirect.match(/^([A-Za-zÅÄÖåäö]+)\s*(.+)$/);
  if (!prefixMatch) {
    return compactDirect;
  }

  const prefix = prefixMatch[1];
  const remainder = prefixMatch[2];
  return remainder
    .split(/\s*,\s*/)
    .map((part) => {
      if (!part) {
        return '';
      }

      if (/^[A-Za-zÅÄÖåäö]+\s*\d+/.test(part)) {
        return part.replace(/\s+/g, '');
      }

      return `${prefix}${part.replace(/\s+/g, '')}`;
    })
    .filter(Boolean)
    .join(', ');
};

const parseOuterBoundaries = (value = '') => {
  const parts = String(value || '').split(/\s*-\s*/).map((part) => part.trim()).filter(Boolean);
  return {
    start: compactBoundaryToken(parts[0] || ''),
    end: compactBoundaryToken(parts.slice(1).join(' - ')),
  };
};

const deriveStationTrackLabel = (boundaryText = '') => {
  const normalized = String(boundaryText || '').replace(/\s+/g, '');
  if (!normalized) {
    return '';
  }

  if (/(?:33|34|82|83|84)/.test(normalized)) {
    return 'Spår 3, 4';
  }

  if (/(?:11|12|21|22)/.test(normalized)) {
    return 'Spår 1, 2';
  }

  return '';
};

const escapeRegExp = (value = '') => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildWorkingSet = (baseItems, extraItems = []) => {
  const working = [];
  const seen = new Set();

  for (const item of [...baseItems, ...extraItems]) {
    const normalizedName = normalizeDriftplatsName(item?.name || '');
    if (!normalizedName || seen.has(normalizedName)) {
      continue;
    }

    seen.add(normalizedName);
    working.push(createPointRecord(item));
  }

  return working;
};

const buildNeighborGraph = (items) => {
  const adjacency = Array.from({ length: items.length }, () => new Map());

  for (let index = 0; index < items.length; index += 1) {
    const source = items[index];
    const neighbors = [];

    for (let otherIndex = 0; otherIndex < items.length; otherIndex += 1) {
      if (index === otherIndex) {
        continue;
      }

      const distance = distanceBetween(source, items[otherIndex]);
      if (distance <= MAX_NEIGHBOR_DISTANCE) {
        neighbors.push({ otherIndex, distance });
      }
    }

    neighbors
      .sort((left, right) => left.distance - right.distance)
      .slice(0, MAX_NEIGHBORS)
      .forEach(({ otherIndex, distance }) => {
        adjacency[index].set(otherIndex, distance);
        adjacency[otherIndex].set(index, distance);
      });
  }

  return adjacency;
};

const findShortestPath = (items, adjacency, startIndex, endIndex) => {
  const queue = [{ cost: 0, index: startIndex }];
  const costs = new Map([[startIndex, 0]]);
  const previous = new Map([[startIndex, null]]);

  while (queue.length) {
    queue.sort((left, right) => left.cost - right.cost);
    const current = queue.shift();

    if (!current || current.cost !== costs.get(current.index)) {
      continue;
    }

    if (current.index === endIndex) {
      break;
    }

    for (const [neighborIndex, edgeCost] of adjacency[current.index].entries()) {
      const nextCost = current.cost + edgeCost;
      if (nextCost >= (costs.get(neighborIndex) ?? Number.POSITIVE_INFINITY)) {
        continue;
      }

      costs.set(neighborIndex, nextCost);
      previous.set(neighborIndex, current.index);
      queue.push({ cost: nextCost, index: neighborIndex });
    }
  }

  if (!previous.has(endIndex)) {
    return [];
  }

  const path = [];
  let cursor = endIndex;
  while (cursor !== null) {
    path.unshift(cursor);
    cursor = previous.get(cursor) ?? null;
  }

  return path.map((index) => items[index]);
};

const getInsertionCandidate = (items, start, end, blockedNames = new Set()) => {
  const segmentLength = distanceBetween(start, end);
  if (segmentLength < MIN_SEGMENT_LENGTH) {
    return null;
  }

  const dx = Number(end.x) - Number(start.x);
  const dy = Number(end.y) - Number(start.y);
  const segmentLengthSquared = dx * dx + dy * dy;
  const perpendicularLimit = Math.min(MAX_INSERTION_DISTANCE, Math.max(MIN_INSERTION_DISTANCE, segmentLength * 0.2));
  const startKey = normalizeDriftplatsName(start.name);
  const endKey = normalizeDriftplatsName(end.name);

  let bestCandidate = null;

  for (const candidate of items) {
    const candidateKey = normalizeDriftplatsName(candidate.name);
    if (!candidateKey || blockedNames.has(candidateKey) || candidateKey === startKey || candidateKey === endKey) {
      continue;
    }

    const distanceFromStart = distanceBetween(start, candidate);
    const distanceToEnd = distanceBetween(candidate, end);
    if (Math.min(distanceFromStart, distanceToEnd) < MIN_ENDPOINT_GAP) {
      continue;
    }

    const ratio = (distanceFromStart + distanceToEnd) / segmentLength;
    if (ratio > MAX_INSERTION_RATIO) {
      continue;
    }

    const projection = (((Number(candidate.x) - Number(start.x)) * dx) + ((Number(candidate.y) - Number(start.y)) * dy)) / segmentLengthSquared;
    if (projection < 0.08 || projection > 0.92) {
      continue;
    }

    const projectedX = Number(start.x) + (projection * dx);
    const projectedY = Number(start.y) + (projection * dy);
    const perpendicularDistance = Math.hypot(Number(candidate.x) - projectedX, Number(candidate.y) - projectedY);
    if (perpendicularDistance > perpendicularLimit) {
      continue;
    }

    const scoredCandidate = {
      candidate,
      ratio,
      perpendicularDistance,
      projection,
    };

    if (
      !bestCandidate
      || scoredCandidate.ratio < bestCandidate.ratio
      || (
        Math.abs(scoredCandidate.ratio - bestCandidate.ratio) < 0.0001
        && scoredCandidate.perpendicularDistance < bestCandidate.perpendicularDistance
      )
    ) {
      bestCandidate = scoredCandidate;
    }
  }

  return bestCandidate?.candidate || null;
};

const expandSegment = (items, start, end, blockedNames, depth = 0) => {
  if (depth >= MAX_RECURSION_DEPTH) {
    return [start, end];
  }

  const candidate = getInsertionCandidate(items, start, end, blockedNames);
  if (!candidate) {
    return [start, end];
  }

  const candidateKey = normalizeDriftplatsName(candidate.name);
  blockedNames.add(candidateKey);

  const left = expandSegment(items, start, candidate, blockedNames, depth + 1);
  const right = expandSegment(items, candidate, end, blockedNames, depth + 1);
  return [...left.slice(0, -1), ...right];
};

const densifyPath = (items, route) => {
  if (route.length < 2) {
    return route;
  }

  const blockedNames = new Set(route.map((item) => normalizeDriftplatsName(item.name)));
  const expanded = [];

  for (let index = 0; index < route.length - 1; index += 1) {
    const segment = expandSegment(items, route[index], route[index + 1], blockedNames);
    if (!expanded.length) {
      expanded.push(...segment);
      continue;
    }

    expanded.push(...segment.slice(1));
  }

  return expanded;
};

const searchOperationalPoints = async (searchString = '') => {
  const response = await fetch(NJDB_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      driftbidrag_Statlig: true,
      gatunamn: true,
      kommun: true,
      koordinat: true,
      ort: true,
      tatort: true,
      vagnummer: true,
      searchFor: 'trafikplatsjvg',
      searchString: String(searchString || '').trim(),
      bandel: true,
      trafikplats: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`NJDB-sokningen misslyckades (${response.status})`);
  }

  const payload = await response.json();
  return Array.isArray(payload)
    ? payload
        .filter((item) => item?.Type === 12 && isOperationalPointKind(item?.Kommun))
        .map((item) => {
          const point = parsePointWkt(item?.WKT);
          if (!point) {
            return null;
          }

          return createPointRecord({
            name: item.Name,
            code: item.Code,
            kind: item.Kommun,
            x: point.x,
            y: point.y,
          });
        })
        .filter(Boolean)
    : [];
};

const resolveOperationalPoint = async (inputName, items) => {
  const normalizedInput = normalizeDriftplatsName(inputName);
  if (!normalizedInput) {
    throw new Error('Driftplats saknas');
  }

  const localExactMatch = items.find((item) => normalizeDriftplatsName(item.name) === normalizedInput);
  if (localExactMatch) {
    return localExactMatch;
  }

  const liveMatches = await searchOperationalPoints(inputName);
  if (!liveMatches.length) {
    throw new Error(`Hittade ingen driftplats for "${inputName}"`);
  }

  const scoredMatches = liveMatches
    .map((match) => {
      const normalizedName = normalizeDriftplatsName(match.name);
      const exactMatch = normalizedName === normalizedInput;
      const prefixMatch = normalizedName.startsWith(normalizedInput);
      const containsMatch = normalizedName.includes(normalizedInput);

      return {
        match,
        score: exactMatch ? 3 : prefixMatch ? 2 : containsMatch ? 1 : 0,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.match.name.localeCompare(right.match.name, 'sv');
    });

  return scoredMatches[0].match;
};

const parseInputNames = (value = '') =>
  String(value || '')
    .split(/\s*(?:,|;|\n|\btill\b)\s*/i)
    .map((entry) => entry.trim())
    .filter(Boolean);

const parseSignalDisplay = (rawText = '', stationCode = '') => {
  const normalizedText = String(rawText || '').replace(/\s+/g, ' ').trim();
  const numberMatch = normalizedText.match(/(\d+[A-Za-z]?)/);
  if (!numberMatch) {
    return '';
  }

  return `${stationCode}${numberMatch[1]}`;
};

const createSignalRecord = (signal, stationCode = '') => {
  const point = parseSignalWkt(signal?.WKT || '');
  const rawText = String(signal?.ObjektText || '').replace(/\s+/g, ' ').trim();
  if (!point || !rawText) {
    return null;
  }

  const kind = rawText.startsWith('INF') ? 'INF' : rawText.startsWith('M ') ? 'M' : 'OTHER';
  const display = parseSignalDisplay(rawText, stationCode);
  if (!display) {
    return null;
  }

  return {
    rawText,
    display,
    kind,
    x: point.x,
    y: point.y,
  };
};

const dedupeSignals = (signals = [], station = null) => {
  const deduped = new Map();

  for (const signal of signals) {
    const existing = deduped.get(signal.display);
    const signalDistance = station ? distanceBetween(station, signal) : Number.POSITIVE_INFINITY;
    const existingDistance = existing && station ? distanceBetween(station, existing) : Number.POSITIVE_INFINITY;

    if (
      !existing
      || (
        signal.kind === existing.kind
        && signalDistance < existingDistance
      )
      || (
        signal.kind === 'INF'
        && existing.kind !== 'INF'
      )
      || (
        signal.kind === 'INF'
        && existing.kind === 'INF'
        && signalDistance < existingDistance
      )
    ) {
      deduped.set(signal.display, signal);
    }
  }

  return [...deduped.values()];
};

const fetchStationSignals = async (station) => {
  const cacheKey = normalizeDriftplatsName(station?.name || '');
  if (stationSignalCache.has(cacheKey)) {
    return stationSignalCache.get(cacheKey);
  }

  const response = await fetch(NJDB_INFO_CLICK_MULTIPLE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metaKeys: [SIGNAL_META_KEY],
      extent: [
        Number(station.x) - SIGNAL_SEARCH_RADIUS,
        Number(station.y) - SIGNAL_SEARCH_RADIUS,
        Number(station.x) + SIGNAL_SEARCH_RADIUS,
        Number(station.y) + SIGNAL_SEARCH_RADIUS,
      ],
      viewDate: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Kunde inte hamta signaler for ${station.name}`);
  }

  const payload = await response.json();
  const rawSignals = Array.isArray(payload?.[SIGNAL_META_KEY]) ? payload[SIGNAL_META_KEY] : [];
  const parsedSignals = rawSignals
    .map((signal) => createSignalRecord(signal, station.code))
    .filter(Boolean)
    .filter((signal) => signal.kind === 'INF' || signal.kind === 'M');

  const localSignals = parsedSignals.filter((signal) => distanceBetween(station, signal) <= LOCAL_SIGNAL_DISTANCE_LIMIT);
  const finalSignals = dedupeSignals(
    localSignals.length ? localSignals : parsedSignals,
    station
  );

  stationSignalCache.set(cacheKey, finalSignals);
  return finalSignals;
};

const pickDirectionalSignal = (station, target, signals = [], preferredKinds = ['INF', 'M']) => {
  const targetVectorX = Number(target.x) - Number(station.x);
  const targetVectorY = Number(target.y) - Number(station.y);
  const targetLength = Math.hypot(targetVectorX, targetVectorY);
  if (!targetLength) {
    return '';
  }

  let bestSignal = null;

  for (const kind of preferredKinds) {
    for (const signal of signals.filter((candidate) => candidate.kind === kind)) {
      const signalVectorX = Number(signal.x) - Number(station.x);
      const signalVectorY = Number(signal.y) - Number(station.y);
      const signalLength = Math.hypot(signalVectorX, signalVectorY);
      if (!signalLength) {
        continue;
      }

      const alignment = ((signalVectorX * targetVectorX) + (signalVectorY * targetVectorY)) / (signalLength * targetLength);
      if (alignment <= 0.2) {
        continue;
      }

      const candidate = {
        display: signal.display,
        kind: signal.kind,
        alignment,
        distance: signalLength,
      };

      if (
        !bestSignal
        || candidate.alignment > bestSignal.alignment
        || (
          Math.abs(candidate.alignment - bestSignal.alignment) < 0.02
          && candidate.distance < bestSignal.distance
        )
      ) {
        bestSignal = candidate;
      }
    }

    if (bestSignal) {
      return bestSignal.display;
    }
  }

  return '';
};

const parsePlacesWithSignals = async (input) => {
  const sequence = await expandDriftplatsSequence(input);
  const cachedItems = loadCachedDriftplatser();
  const places = [];

  for (const name of sequence.places) {
    places.push(await resolveOperationalPoint(name, cachedItems));
  }

  return places;
};

const buildSignalSections = async ({ places: inputPlaces, outerBoundaries = '' } = {}) => {
  const places = await parsePlacesWithSignals(inputPlaces);
  if (places.length < 2) {
    throw new Error('Ange minst tva driftplatser for att skapa delomraden.');
  }

  const outer = parseOuterBoundaries(outerBoundaries);
  const stationSignals = new Map();

  for (const place of places) {
    stationSignals.set(normalizeDriftplatsName(place.name), await fetchStationSignals(place));
  }

  const inboundSignals = new Map();
  const outboundSignals = new Map();

  for (let index = 0; index < places.length; index += 1) {
    const place = places[index];
    const placeKey = normalizeDriftplatsName(place.name);
    const signals = stationSignals.get(placeKey) || [];

    if (index > 0) {
      inboundSignals.set(placeKey, pickDirectionalSignal(place, places[index - 1], signals));
    }

    if (index < places.length - 1) {
      outboundSignals.set(placeKey, pickDirectionalSignal(place, places[index + 1], signals));
    }
  }

  const sections = [];
  let displayIndex = 1;

  for (let index = 0; index < places.length - 1; index += 1) {
    const current = places[index];
    const next = places[index + 1];
    const currentKey = normalizeDriftplatsName(current.name);
    const nextKey = normalizeDriftplatsName(next.name);
    const lineStart = index === 0 ? (outer.start || outboundSignals.get(currentKey) || '') : (outboundSignals.get(currentKey) || '');
    const lineEnd = inboundSignals.get(nextKey) || '';

    sections.push({
      type: 'Delområde',
      namingMode: 'NUMBERS',
      displayIndex,
      name: `${current.name} - ${next.name}`,
      signal: `${current.name} - ${next.name}`,
      granspunktStart: lineStart,
      granspunktSlut: lineEnd,
      granspunkter: [lineStart, lineEnd].filter(Boolean).join(' - '),
      spar: 'Spår E',
    });
    displayIndex += 1;

    const stationStart = lineEnd;
    const stationEnd = index === places.length - 2
      ? (outer.end || '')
      : (outboundSignals.get(nextKey) || '');

    sections.push({
      type: 'Delområde',
      namingMode: 'NUMBERS',
      displayIndex,
      name: next.name,
      signal: next.name,
      granspunktStart: stationStart,
      granspunktSlut: stationEnd,
      granspunkter: [stationStart, stationEnd].filter(Boolean).join(' - '),
      spar: deriveStationTrackLabel([stationStart, stationEnd].filter(Boolean).join(' - ')),
    });
    displayIndex += 1;
  }

  return {
    places: places.map((place) => place.name),
    sections,
  };
};

const expandDriftplatsSequence = async (input) => {
  const names = Array.isArray(input) ? input : parseInputNames(input);
  if (names.length < 2) {
    throw new Error('Ange minst tva driftplatser, till exempel "Kattarp, Angelholm".');
  }

  const cachedItems = loadCachedDriftplatser();
  const resolvedPoints = [];

  for (const name of names) {
    resolvedPoints.push(await resolveOperationalPoint(name, cachedItems));
  }

  const workingItems = buildWorkingSet(cachedItems, resolvedPoints);
  const adjacency = buildNeighborGraph(workingItems);
  const finalSequence = [];

  for (let index = 0; index < resolvedPoints.length - 1; index += 1) {
    const start = resolvedPoints[index];
    const end = resolvedPoints[index + 1];
    const startKey = normalizeDriftplatsName(start.name);
    const endKey = normalizeDriftplatsName(end.name);
    const startIndex = workingItems.findIndex((item) => normalizeDriftplatsName(item.name) === startKey);
    const endIndex = workingItems.findIndex((item) => normalizeDriftplatsName(item.name) === endKey);

    let route = [];
    if (startIndex >= 0 && endIndex >= 0) {
      route = findShortestPath(workingItems, adjacency, startIndex, endIndex);
    }

    const densifiedRoute = densifyPath(workingItems, route.length ? route : [start, end]);
    if (!finalSequence.length) {
      finalSequence.push(...densifiedRoute);
      continue;
    }

    finalSequence.push(...densifiedRoute.slice(1));
  }

  const dedupedSequence = [];
  const seen = new Set();

  for (const item of finalSequence) {
    const key = normalizeDriftplatsName(item.name);
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    dedupedSequence.push(item);
  }

  const namesOnly = dedupedSequence.map((item) => item.name);
  return {
    places: namesOnly,
    value: namesOnly.join(', '),
  };
};

module.exports = {
  buildSignalSections,
  expandDriftplatsSequence,
  loadCachedDriftplatser,
  parseInputNames,
};
