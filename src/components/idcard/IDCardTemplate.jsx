import { QRCodeSVG } from "qrcode.react";
import nyscLogo from "../../assets/NYSC-LOGO.png";

const DARK_GREEN = "#1B5E20";
const LIME = "#7CB342";
const LIME_EDGE = "#2E7D32";

const CARD_W = "85.6mm";
const CARD_H = "54mm";

const cardBase = {
  width: CARD_W,
  height: CARD_H,
  fontFamily: "Arial, Helvetica, sans-serif",
  overflow: "hidden",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  backgroundColor: "#ffffff",
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
};

/*
 * SVG diagonal stripe — matches the 142deg lime/yellow-green band from the reference image.
 * Using SVG polygons instead of CSS linear-gradient because SVG renders identically in
 * both screen and print contexts without requiring print-color-adjust on the element itself.
 *
 * Geometry:
 *   Card body: 85.6mm × 34.5mm (54mm − 11.5mm header − 8mm footer)
 *   Gradient direction at 142°: vector (0.6157, 0.7880); perpendicular: (0.788, −0.616)
 *   Gradient line length L ≈ 59.3mm; start point (24.54, −6.11)
 *   Stop positions: 36% → (37.69, 10.71)  38.5% → (38.60, 11.88)
 *                   61% → (46.79, 22.39)  63.5% → (47.70, 23.54)
 *   Each polygon extends ±50mm perpendicular (clipped by overflow:hidden on parent)
 */
function DiagonalStripe() {
  return (
    <svg
      viewBox="0 0 85.6 34.5"
      preserveAspectRatio="none"
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="85.6" height="34.5" fill="#fff" />
      {/* LIME_EDGE band 1 (36%–38.5%) */}
      <polygon points="77.1,-20.1 -1.7,41.5 -0.8,42.7 78.0,-18.9" fill={LIME_EDGE} />
      {/* LIME main band (38.5%–61%) */}
      <polygon points="78.0,-18.9 -0.8,42.7 7.4,53.2 86.2,-8.4" fill={LIME} />
      {/* LIME_EDGE band 2 (61%–63.5%) */}
      <polygon points="86.2,-8.4 7.4,53.2 8.3,54.3 87.1,-7.3" fill={LIME_EDGE} />
    </svg>
  );
}

function CardHeader({ subtitle }) {
  return (
    <div style={{
      backgroundColor: DARK_GREEN,
      color: "#fff",
      padding: "1.5mm 2mm 1.5mm 2.5mm",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1.5mm",
      minHeight: "11.5mm",
      flexShrink: 0,
      WebkitPrintColorAdjust: "exact",
      printColorAdjust: "exact",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: "bold",
          fontSize: "8pt",
          letterSpacing: "0.5px",
          lineHeight: 1.2,
          textTransform: "uppercase",
        }}>
          NATIONAL YOUTH SERVICE CORPS
        </div>
        {subtitle && (
          <div style={{ fontSize: "6pt", marginTop: "0.8mm", letterSpacing: "0.3px" }}>
            {subtitle}
          </div>
        )}
      </div>
      <img
        src={nyscLogo}
        alt="NYSC"
        style={{
          width: "13mm",
          height: "13mm",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    </div>
  );
}

function Field({ label, value, bold, underline = true }) {
  return (
    <div style={{ lineHeight: 1.25 }}>
      <div style={{
        fontSize: "4.3pt",
        color: "#444",
        textTransform: "uppercase",
        letterSpacing: "0.2px",
        fontWeight: "normal",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: bold ? "6.5pt" : "6pt",
        fontWeight: bold ? "bold" : "normal",
        color: "#111",
        borderBottom: underline ? "0.5px solid #bbb" : "none",
        paddingBottom: "0.3mm",
        minHeight: "5.5pt",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {value || ""}
      </div>
    </div>
  );
}

export function IDCardFront({ applicant, officerState }) {
  if (!applicant) return null;

  const fullName = [applicant.surname, applicant.firstName, applicant.middleName]
    .filter(Boolean).join(" ").toUpperCase();
  const deployState = (applicant.stateOfResidence || officerState || "").toUpperCase();
  const stateCode = (applicant.stateOfOrigin || "")
    .substring(0, 2).toUpperCase();

  return (
    <div style={cardBase}>
      <CardHeader subtitle="CORPS MEMBER IDENTITY CARD" />

      {/* Body */}
      <div style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
        position: "relative",
      }}>
        <DiagonalStripe />

        {/* Left: photo + signature */}
        <div style={{
          width: "24mm",
          padding: "1.5mm 1mm 1mm 1.5mm",
          display: "flex",
          flexDirection: "column",
          gap: "0.8mm",
          flexShrink: 0,
          zIndex: 1,
        }}>
          {/* Passport photo */}
          <div style={{
            width: "19mm",
            height: "24mm",
            border: "1px solid #888",
            overflow: "hidden",
            backgroundColor: "#d8d8d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}>
            {applicant.photoURL
              ? <img src={applicant.photoURL} alt="Photo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ color: "#999", fontSize: "5pt" }}>PHOTO</span>}
          </div>

          {/* Signature */}
          <div style={{
            width: "19mm",
            height: "9mm",
            border: "1px solid #666",
            backgroundColor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}>
            {applicant.signatureURL
              ? <img src={applicant.signatureURL} alt="Signature"
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              : <span style={{ color: "#aaa", fontSize: "5pt" }}>——</span>}
          </div>

          <div style={{
            fontSize: "4pt",
            color: "#333",
            textAlign: "center",
            fontWeight: "bold",
            textTransform: "uppercase",
            backgroundColor: "rgba(255,255,255,0.7)",
            lineHeight: 1.2,
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}>
            CORPS MEMBER<br />SIGNATURE
          </div>
        </div>

        {/* Right: fields */}
        <div style={{
          flex: 1,
          padding: "1.5mm 2mm 1mm 0.5mm",
          display: "flex",
          flexDirection: "column",
          gap: "1mm",
          zIndex: 1,
          backgroundColor: "rgba(255,255,255,0.55)",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}>
          {/* Row 1: Full Name | State Code */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5mm" }}>
            <Field label="Full Name" value={fullName} />
            <Field label="State Code" value={stateCode} />
          </div>

          {/* Row 2: Date of Birth | Sex */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5mm" }}>
            <Field label="Date of Birth" value={applicant.dateOfBirth} />
            <Field label="Sex" value={applicant.gender} />
          </div>

          {/* Row 3: Call-Up Number | Blood Group */}
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5mm" }}>
            <Field label="Call-Up Number" value={applicant.personalNumber} bold />
            <Field label="Blood Group" value={applicant.bloodGroup} />
          </div>

          {/* Row 4: State of Origin | State of Deployment */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5mm" }}>
            <Field label="State of Origin" value={(applicant.stateOfOrigin || "").toUpperCase()} />
            <Field label="State of Deployment" value={deployState} />
          </div>
        </div>
      </div>

      {/* Footer: 3-section bar */}
      <div style={{
        backgroundColor: DARK_GREEN,
        color: "#fff",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        fontSize: "4.5pt",
        flexShrink: 0,
        minHeight: "8mm",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}>
        <div style={{
          padding: "1mm 1.5mm",
          borderRight: "1px solid rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "flex-start",
        }}>
          <span style={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.2px" }}>
            CORPS MEMBER SIGNATURE
          </span>
        </div>
        <div style={{
          padding: "1mm 1.5mm",
          borderRight: "1px solid rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
        }}>
          <span style={{ opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.2px" }}>
            DG'S SIGNATURE
          </span>
        </div>
        <div style={{
          padding: "1mm 1.5mm",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
        }}>
          <span style={{ opacity: 0.8 }}>Valid Till: ——</span>
        </div>
      </div>
    </div>
  );
}

export function IDCardBack({ applicant }) {
  if (!applicant) return null;

  return (
    <div style={cardBase}>
      <CardHeader />

      {/* Body */}
      <div style={{
        display: "flex",
        flex: 1,
        gap: "2mm",
        padding: "1.5mm 2mm 1.5mm 2mm",
        overflow: "hidden",
        position: "relative",
      }}>
        <DiagonalStripe />

        {/* Left text column */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1mm",
          zIndex: 1,
          backgroundColor: "rgba(255,255,255,0.55)",
          padding: "0.5mm",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}>
          <div style={{ fontSize: "5pt", lineHeight: 1.3 }}>
            <span style={{ fontWeight: "bold" }}>Emergency NOK: </span>
            <span>{applicant.nextOfKinName}</span>
            {applicant.nextOfKinPhone && <span> — {applicant.nextOfKinPhone}</span>}
          </div>

          <p style={{ fontSize: "4.6pt", color: "#333", lineHeight: 1.45, margin: 0 }}>
            This identity card is an official document and related only to the person described.
            Impersonation of the authorised holder, or the alteration, destruction, transfer to another
            person of this card are criminal offences and will be met with appropriate sanctions.
          </p>

          <p style={{ fontSize: "4.6pt", color: "#555", margin: 0 }}>
            If found, please return to:
          </p>

          <div style={{ fontSize: "5pt", fontWeight: "bold", color: DARK_GREEN, lineHeight: 1.3 }}>
            NATIONAL DIRECTORATE HEADQUARTERS
          </div>

          <p style={{ fontSize: "4.5pt", color: "#444", margin: 0, lineHeight: 1.4 }}>
            Plot 416, Tigris Crescent, Off Aguiyi Ironsi Street,<br />
            Maitama, Abuja or Nearest Police Station.
          </p>

          <div style={{ fontSize: "5pt", fontWeight: "bold", color: "#222" }}>
            NYSC Emergency No: 6972
          </div>
        </div>

        {/* Right: QR code */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1mm",
          minWidth: "19mm",
          zIndex: 1,
        }}>
          <div style={{
            border: "2px solid #222",
            padding: "1mm",
            backgroundColor: "#fff",
            WebkitPrintColorAdjust: "exact",
            printColorAdjust: "exact",
          }}>
            <QRCodeSVG
              value={applicant.personalNumber || "NYSC"}
              size={56}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <div style={{
            fontSize: "4.3pt",
            color: "#333",
            textAlign: "center",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.2px",
          }}>
            SCAN FOR VERIFICATION
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IDCardTemplate({ applicant, officerState }) {
  return (
    <div>
      <IDCardFront applicant={applicant} officerState={officerState} />
      <IDCardBack applicant={applicant} />
    </div>
  );
}
