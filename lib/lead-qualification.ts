type QualificationAnswers = { profile: string; treatmentValue: string; timeline: string; specialty: string[]; cityCountry: string; decisionMaker: string; decisionMakerAttends: string; revenue: string; organicExpectation: string; patientGoal: string; chairs: string; hasLab: string; technology: string[] };

const servedMarkets = ["colombia", "usa", "united states", "estados unidos", "mexico", "costa rica"];


export function classify(answers: QualificationAnswers) {
  const declined = answers.profile === "other" || ["under500", "five1500"].includes(answers.treatmentValue) || answers.timeline === "exploring";
  if (declined) return { status: "not_qualified", points: 0, priority: "none" };

  const hasSpecialty = answers.specialty.length > 0;
  const normalizedLocation = answers.cityCountry.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const marketSupported = servedMarkets.some((market) => normalizedLocation.includes(market));
  const manualReview =
    !marketSupported || answers.revenue === "private" || answers.organicExpectation === "no" ||
    (answers.decisionMaker === "no" && answers.decisionMakerAttends === "no");

  if (answers.revenue !== "private" && !["ten25", "twentyFive60", "over60"].includes(answers.revenue)) return { status: "not_qualified", points: 0, priority: "none" };

  let points = 0;
  if (hasSpecialty) points += 3;
  if (["owner", "independent", "associate", "marketing"].includes(answers.profile)) points += 2;
  if (["ten25", "twentyFive60", "over60"].includes(answers.revenue)) points += 2;
  if (["fifteen4k", "over4k"].includes(answers.treatmentValue)) points += 2;
  if (["one3", "four10", "over10"].includes(answers.patientGoal)) points += 1;
  if (answers.chairs) points += 1;
  if (answers.hasLab === "yes") points += 1;
  points += ["cadcam", "scanner", "tomography", "printer"].filter((technology) => answers.technology.includes(technology)).length;
  if (answers.decisionMaker === "sole") points += 2;
  if (answers.decisionMaker === "shared") points += 1;

  if (answers.timeline === "under30") points += 10;
  if (answers.timeline === "one3") points += 3;

  return { status: manualReview ? "manual_review" : "qualified", points, priority: answers.timeline === "under30" ? "high" : "normal" };
}

