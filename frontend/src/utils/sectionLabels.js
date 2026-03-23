export const getSectionMarker = (section, index) => {
  if (section?.namingMode === 'NUMBERS') {
    if (section?.displayIndex !== undefined && section?.displayIndex !== null && section?.displayIndex !== '') {
      return String(section.displayIndex);
    }
    return String(index + 1);
  }

  return String.fromCharCode(65 + index);
};

export const getSectionLabel = (section, index) =>
  `${section?.type || 'Delomrade'} ${getSectionMarker(section, index)}`;
