from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

OUT = "public/demo/fictional-competition-rules.pdf"
GREEN = HexColor("#174B3A")
INK = HexColor("#18241F")
MUTED = HexColor("#617069")
LINE = HexColor("#DCE2DD")

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(188 * mm, 14 * mm, f"Page {doc.page}")
    canvas.restoreState()

styles = getSampleStyleSheet()
title = ParagraphStyle("Title", parent=styles["Title"], fontName="Times-Roman", fontSize=30, leading=34, textColor=INK, alignment=0, spaceAfter=10)
subtitle = ParagraphStyle("Subtitle", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=15, textColor=MUTED, spaceAfter=24)
h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontName="Times-Roman", fontSize=21, leading=26, textColor=INK, spaceBefore=8, spaceAfter=12)
h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=GREEN, spaceBefore=14, spaceAfter=6)
body = ParagraphStyle("Body", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=15, textColor=INK, spaceAfter=8)
note = ParagraphStyle("Note", parent=body, backColor=HexColor("#EAF2ED"), borderColor=LINE, borderWidth=.5, borderPadding=10, spaceBefore=10, spaceAfter=12)

story = [Paragraph("Northbridge Community Cup", title), Paragraph("Synthetic Competition Rules - 2026 Edition", subtitle), Paragraph("About this document", h1), Paragraph("This fictional rulebook is provided solely as safe demonstration content for RuleWise. It describes an imaginary community competition and may be copied, modified, and redistributed.", body), Paragraph("Effective date", h2), Paragraph("These rules take effect on 1 January 2026 and remain in force until replaced by a later edition.", body), Paragraph("Document authority", h2), Paragraph("The Competition Committee maintains this rulebook. Questions of interpretation must be resolved using the written rules and any published committee notice.", body), Paragraph("Quick reference", h2)]
rows = [["Topic", "Section"], ["Player eligibility", "2"], ["Restarts and second touches", "4"], ["Venue safety inspection", "6"], ["Appeals", "8"]]
table = Table(rows, colWidths=[100*mm, 45*mm], hAlign="LEFT")
table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),GREEN),("TEXTCOLOR",(0,0),(-1,0),HexColor("#FFFFFF")),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTNAME",(0,1),(-1,-1),"Helvetica"),("FONTSIZE",(0,0),(-1,-1),9),("GRID",(0,0),(-1,-1),.5,LINE),("ROWBACKGROUNDS",(0,1),(-1,-1),[HexColor("#FFFFFF"),HexColor("#F7F8F5")]),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7)]))
story += [table, PageBreak(), Paragraph("1. Competition administration", h1), Paragraph("1.1 The Competition Director schedules fixtures and records results. The director may not alter a playing rule without a written decision of the Competition Committee.", body), Paragraph("1.2 Team managers receive official notices through the registered competition email address. Delivery to that address is treated as delivery to the team.", body), Paragraph("2. Player eligibility", h1), Paragraph("2.1 A player must be listed on the team roster before participating. The roster closes at 18:00 two business days before the first fixture.", body), Paragraph("2.2 A late registration requires written approval from a majority of the Competition Committee. The Competition Director may receive the request but may not approve it alone.", body), Paragraph("2.3 A player may represent only one team during the same competition stage.", body), PageBreak(), Paragraph("3. Match duration and officials", h1), Paragraph("3.1 A match consists of two periods of twenty-five minutes with a five-minute interval.", body), Paragraph("3.2 The appointed referee controls the match from the first entry onto the playing area until the match report is submitted.", body), Paragraph("4. Restarts", h1), Paragraph("4.1 A restart is taken from the place specified by the referee. Opposing players must remain at least five metres from the ball until it is in play.", body), Paragraph("4.2 The ball is in play when it is clearly kicked and moves. The player taking the restart must not touch the ball a second time until it has touched another player.", note), Paragraph("4.3 If the taker touches the ball again before another player touches it, an indirect restart is awarded to the opposing team from the place of the second touch.", body), PageBreak(), Paragraph("5. Substitutions", h1), Paragraph("5.1 Each team may name up to five substitutes. A maximum of three substitution opportunities is permitted, excluding the interval.", body), Paragraph("5.2 The substitute may enter only after the replaced player has left and the referee has given permission.", body), Paragraph("6. Venue safety", h1), Paragraph("6.1 The venue operations lead must complete and sign the safety inspection checklist before doors open to participants or spectators.", note), Paragraph("6.2 The inspection covers emergency exits, playing-surface hazards, first-aid equipment, and access routes.", body), Paragraph("6.3 If a critical hazard cannot be corrected, the venue operations lead must notify the Competition Director and prevent access to the affected area.", body), PageBreak(), Paragraph("7. Disciplinary decisions", h1), Paragraph("7.1 The Disciplinary Panel provides its decision in writing and states the rule applied, the material facts, and any sanction.", body), Paragraph("7.2 Event-day operational rulings are final unless this rulebook expressly provides otherwise.", body), Paragraph("8. Appeals", h1), Paragraph("8.1 A written appeal of a disciplinary decision must be submitted within five business days after the decision notice is delivered.", note), Paragraph("8.2 An appeal must identify the challenged finding and explain the alleged error. New evidence may be included only when it could not reasonably have been provided earlier.", body), Paragraph("8.3 The Appeals Committee may affirm, vary, or set aside the decision. Its written decision is final.", body), Spacer(1, 12), Paragraph("End of synthetic competition rules", subtitle)]

doc = SimpleDocTemplate(OUT, pagesize=A4, rightMargin=22*mm, leftMargin=22*mm, topMargin=34*mm, bottomMargin=22*mm, title="Northbridge Community Cup - Synthetic Competition Rules", author="RuleWise")
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
