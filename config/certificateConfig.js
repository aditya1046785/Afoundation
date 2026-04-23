// Centralized certificate layout + style controls.
// Adjust these values to reposition and restyle dynamic text overlays.

export const CERTIFICATE_CONFIG = {
  backgroundImage: "/images/certificate-bg.png",

  page: {
    // A4 landscape ratio: 297 x 210
    widthMm: 297,
    heightMm: 210,
    aspectRatio: 297 / 210,
  },

  preview: {
    // Max width of preview card in the admin UI.
    maxWidthPx: 1100,
  },

  text: {
    // Controls MEMBER NAME position + style.
    memberName: {
      topPercent: 48,
      leftPercent: 50,
      maxWidthPercent: 60,
      fontSizePx: 52,
      fontWeight: 700,
      color: "#8B4513",
      textAlign: "center",
      letterSpacingPx: 0,
      fontFamily: "'Great Vibes', 'Dancing Script', cursive",
      pdfFontSizePt: 36,
      pdfFontFamily: "times",
      pdfFontStyle: "bolditalic",
    },

    // Controls ISSUE DATE position + style.
    issueDate: {
      topPercent: 75,
      leftPercent: 12,
      maxWidthPercent: 34,
      fontSizePx: 16,
      fontWeight: 600,
      color: "#5C3D11",
      textAlign: "left",
      letterSpacingPx: 0,
      fontFamily: "Times New Roman, serif",
      pdfFontSizePt: 12,
      pdfFontFamily: "times",
      pdfFontStyle: "normal",
    },

    // Controls CERTIFICATE NUMBER position + style.
    certificateNo: {
      topPercent: 4,
      leftPercent: 85,
      maxWidthPercent: 22,
      fontSizePx: 16,
      fontWeight: 600,
      color: "#5C3D11",
      textAlign: "right",
      letterSpacingPx: 0,
      fontFamily: "Times New Roman, serif",
      pdfFontSizePt: 12,
      pdfFontFamily: "times",
      pdfFontStyle: "normal",
    },
  },
};

export function getOverlayStyle(fieldConfig) {
  return {
    position: "absolute",
    top: `${fieldConfig.topPercent}%`,
    left: `${fieldConfig.leftPercent}%`,
    maxWidth: `${fieldConfig.maxWidthPercent}%`,
    fontSize: `${fieldConfig.fontSizePx}px`,
    fontWeight: fieldConfig.fontWeight,
    color: fieldConfig.color,
    textAlign: fieldConfig.textAlign,
    letterSpacing: `${fieldConfig.letterSpacingPx || 0}px`,
    fontFamily: fieldConfig.fontFamily,
    lineHeight: fieldConfig.lineHeight || 1.2,
    transform: fieldConfig.textAlign === "center" ? "translateX(-50%)" : "none",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };
}
