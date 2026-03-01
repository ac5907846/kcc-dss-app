import { useState, useMemo } from "react";

const CONSTRUCTS = {
  SOC: {
    label: "Socialization",
    parent: "KCC",
    plain: "Sharing knowledge through direct interactions and collaboration",
    items: [
      { code: "SOC1", text: "Our organization shares experiences with clients", loading: 0.775 },
      { code: "SOC2", text: "We engage in meetings or dialogues with project stakeholders", loading: 0.780 },
      { code: "SOC3", text: "We organize regular meetings or dialogues among divisions, departments, or project teams", loading: 0.801 },
      { code: "SOC4", text: "We create favorable environments to understand professional skills and expertise", loading: 0.792 },
    ],
  },
  EXT: {
    label: "Externalization",
    parent: "KCC",
    plain: "Converting personal expertise into documented, shareable knowledge",
    items: [
      { code: "EXT1", text: "Our organization encourages creative and essential dialogues", loading: 0.912 },
      { code: "EXT2", text: "We exchange various ideas and dialogues across teams", loading: 0.887 },
      { code: "EXT3", text: "We encourage subjective opinions from team members", loading: 0.822 },
      { code: "EXT4", text: "We promote critical thinking and logical analysis of problems", loading: 0.838 },
    ],
  },
  COM: {
    label: "Combination",
    parent: "KCC",
    plain: "Gathering and integrating knowledge from multiple sources",
    items: [
      { code: "COM1", text: "We gather useful information from clients systematically", loading: 0.818 },
      { code: "COM2", text: "We gather information from employees across the organization", loading: 0.736 },
      { code: "COM3", text: "We plan strategies based on published literature, project data, and simulations", loading: 0.690 },
      { code: "COM4", text: "We establish digital databases and documents on implemented projects", loading: 0.796 },
    ],
  },
  INT: {
    label: "Internalization",
    parent: "KCC",
    plain: "Applying and embedding knowledge into daily work routines",
    items: [
      { code: "INT1", text: "Employees apply knowledge to actual works effectively", loading: 0.828 },
      { code: "INT2", text: "We share good results of work across teams and projects", loading: 0.890 },
      { code: "INT3", text: "Employees search and share new values and thoughts", loading: 0.873 },
      { code: "INT4", text: "Employees understand management visions through communications with colleagues", loading: 0.808 },
    ],
  },
  OL: {
    label: "Organizational Learning",
    parent: null,
    plain: "How well your organization acquires, shares, and applies knowledge through training, collaboration, and development programs",
    items: [
      { code: "OL1", text: "Our organization facilitates employees in continuing education", loading: 0.716 },
      { code: "OL2", text: "We promote strategic collaborations to acquire knowledge", loading: 0.688 },
      { code: "OL3", text: "We facilitate employees' experiential learning", loading: 0.643 },
      { code: "OL4", text: "We provide formal training courses or skills training programs regularly", loading: 0.750 },
      { code: "OL5", text: "We provide opportunities for informal individual development or self-learning", loading: 0.783 },
      { code: "OL6", text: "We facilitate employees to attend workshops and symposia", loading: 0.851 },
      { code: "OL7", text: "We evaluate employees' knowledge and expertise regularly", loading: 0.622 },
    ],
  },
  EI: {
    label: "Employee Innovativeness",
    parent: null,
    plain: "How actively your employees generate new ideas, find better ways of working, and contribute creative solutions",
    items: [
      { code: "EI1", text: "Employees generate novel and useful ideas", loading: 0.854 },
      { code: "EI2", text: "Employees develop novel and useful ways of working", loading: 0.870 },
      { code: "EI3", text: "Employees contribute to reduced errors and mistakes at work", loading: 0.670 },
      { code: "EI4", text: "Employees make reasonable decisions in their work", loading: 0.824 },
      { code: "EI5", text: "Employees achieve increased work efficiencies", loading: 0.779 },
      { code: "EI6", text: "Employees contribute to improvement of management processes", loading: 0.815 },
    ],
  },
  SBP: {
    label: "Sustainable Business Performance",
    parent: null,
    plain: "Your organization's long-term success in financial stability, growing market share, and keeping clients satisfied",
    items: [
      { code: "SBP1", text: "We consistently satisfy clients' needs and requirements", loading: 0.669 },
      { code: "SBP2", text: "We are successful in retaining current clients", loading: 0.734 },
      { code: "SBP3", text: "We are increasing our number of new clients", loading: 0.754 },
      { code: "SBP4", text: "Our organization maintains financial stability", loading: 0.700 },
      { code: "SBP5", text: "We achieve sustained profits over time", loading: 0.745 },
      { code: "SBP6", text: "We are increasing our market share", loading: 0.783 },
    ],
  },
};

const PATH_COEFFICIENTS = { KCC_OL: 0.839, KCC_EI: 0.485, OL_EI: 0.487, EI_SBP: 0.754 };
const BENCHMARKS = { KCC: 3.52, OL: 3.41, EI: 3.48, SBP: 3.39 };
const sectionKeys = ["SOC", "EXT", "COM", "INT", "OL", "EI", "SBP"];

const COLORS = {
  KCC: "#1e3a6e", OL: "#4c1d95", EI: "#065f46", SBP: "#7f1d1d",
  KCCLight: "#dbeafe", OLLight: "#ede9fe", EILight: "#d1fae5", SBPLight: "#fee2e2",
};

const weightedScore = (items, responses) => {
  let n = 0, d = 0;
  items.forEach((it) => { const v = responses[it.code]; if (v !== undefined) { n += it.loading * v; d += it.loading; } });
  return d > 0 ? n / d : 0;
};

const getRating = (s) => {
  if (s >= 4.2) return { label: "Excellent", color: "#065f46", bg: "#d1fae5" };
  if (s >= 3.5) return { label: "Good", color: "#1e3a6e", bg: "#dbeafe" };
  if (s >= 2.8) return { label: "Moderate", color: "#92400e", bg: "#fef3c7" };
  if (s >= 2.0) return { label: "Needs Improvement", color: "#7f1d1d", bg: "#fee2e2" };
  return { label: "Critical", color: "#7f1d1d", bg: "#fee2e2" };
};

const LikertButton = ({ value, selected, onClick }) => (
  <button onClick={() => onClick(value)} style={{
    width: 36, height: 36, borderRadius: "50%", border: "2px solid",
    borderColor: selected ? "#1e3a6e" : "#cbd5e1", background: selected ? "#1e3a6e" : "#fff",
    color: selected ? "#fff" : "#94a3b8", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.15s",
  }}>{value}</button>
);

const ScoreCard = ({ label, plain, score, benchmark, color, lightColor }) => {
  const r = getRating(score);
  const diff = score - benchmark;
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 16, border: `1px solid ${lightColor}`, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
        <div style={{ flex: 1, marginRight: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{label}</div>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4, marginTop: 2 }}>{plain}</div>
        </div>
        <div style={{ textAlign: "right", minWidth: 80 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color }}>{score.toFixed(2)}</div>
          <span style={{ fontSize: 11, fontWeight: 600, color: r.color, background: r.bg, padding: "1px 6px", borderRadius: 4 }}>{r.label}</span>
        </div>
      </div>
      <div style={{ position: "relative", height: 14, background: "#f1f5f9", borderRadius: 7, marginTop: 10, overflow: "hidden" }}>
        <div style={{ width: `${(score / 5) * 100}%`, height: "100%", background: color, borderRadius: 7, transition: "width 0.4s", opacity: 0.85 }} />
        <div style={{ position: "absolute", top: 0, left: `${(benchmark / 5) * 100}%`, width: 2, height: "100%", background: "#0f172a", opacity: 0.4 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#94a3b8" }}>Industry average: {benchmark.toFixed(2)}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: diff >= 0 ? "#065f46" : "#7f1d1d" }}>
          {diff >= 0 ? "+" : ""}{diff.toFixed(2)} vs. industry
        </span>
      </div>
    </div>
  );
};

const InfluenceDots = ({ val }) => {
  const c = val >= 0.7 ? "#065f46" : val >= 0.4 ? "#92400e" : "#7f1d1d";
  const filled = val >= 0.7 ? 3 : val >= 0.4 ? 2 : 1;
  return (
    <span style={{ letterSpacing: 2 }}>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ color: i <= filled ? c : "#d1d5db", fontSize: 10 }}>&#9679;</span>
      ))}
    </span>
  );
};

const PathExplainer = ({ from, to, coeff, plain }) => (
  <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0", marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{from} → {to}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>Influence:</span>
        <InfluenceDots val={coeff} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e3a6e" }}>{(coeff * 100).toFixed(0)}%</span>
      </div>
    </div>
    <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{plain}</div>
  </div>
);

const ModelDiagram = ({ scores }) => {
  const box = (x, y, label, score, fill) => {
    const r = getRating(score);
    return (
      <g key={label}>
        <text x={x + 62} y={y - 6} textAnchor="middle" fontSize="10" fill={r.color} fontWeight="600">{r.label}</text>
        <rect x={x} y={y} width="124" height="50" rx="8" fill={fill} />
        <text x={x + 62} y={y + 20} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{label}</text>
        <text x={x + 62} y={y + 38} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">{score.toFixed(2)}</text>
      </g>
    );
  };
  const arrow = (f, t, coeff, x1, y1, x2, y2) => (
    <g key={`${f}-${t}`}>
      <defs><marker id={`a-${f}-${t}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#475569" /></marker></defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="1.5" markerEnd={`url(#a-${f}-${t})`} />
      <rect x={(x1+x2)/2-20} y={(y1+y2)/2-9} width="40" height="18" rx="4" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.5" />
      <text x={(x1+x2)/2} y={(y1+y2)/2+4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#334155">{coeff}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 520 230" style={{ width: "100%", maxWidth: 520 }}>
      {box(10, 90, "KCC", scores.KCC, COLORS.KCC)}
      {box(200, 22, "OL", scores.OL, COLORS.OL)}
      {box(200, 158, "EI", scores.EI, COLORS.EI)}
      {box(390, 90, "SBP", scores.SBP, COLORS.SBP)}
      {arrow("KCC","OL","0.839",134,100,200,55)}
      {arrow("KCC","EI","0.485",134,130,200,172)}
      {arrow("OL","EI","0.487",262,72,262,158)}
      {arrow("EI","SBP","0.754",324,172,390,130)}
    </svg>
  );
};

const getRecommendations = (scores) => {
  const recs = [];
  const subScores = { SOC: scores.SOC, EXT: scores.EXT, COM: scores.COM, INT: scores.INT };
  const sorted = Object.entries(subScores).sort((a, b) => a[1] - b[1]);
  const weakest = sorted[0];
  const strongest = sorted[3];

  if (scores.KCC < BENCHMARKS.KCC) {
    const seciRecs = {
      SOC: { action: "Increase face-to-face knowledge sharing: joint site visits, cross-team mentoring, and regular project review meetings where team members share what they learned.", why: "Your team interactions and experience-sharing practices are the weakest part of your knowledge creation. People learn a lot from watching and talking to each other, but your organization is not creating enough of these opportunities." },
      EXT: { action: "Start documenting lessons learned after each project phase. Create templates for capturing technical solutions and encourage teams to write down their problem-solving approaches.", why: "Your organization struggles to convert personal know-how into written or shared formats. Knowledge stays locked in individual employees' heads instead of becoming organizational assets." },
      COM: { action: "Build centralized knowledge databases, invest in BIM or project data integration tools, and establish protocols for gathering and combining information from across projects.", why: "Your organization is not effectively gathering and connecting information from different sources. Data from clients, employees, past projects, and external sources is not being systematically combined." },
      INT: { action: "Create hands-on training programs, simulation exercises, and structured reflection routines after project milestones. Encourage employees to apply documented knowledge to real work situations.", why: "Employees are not effectively turning available knowledge into practical skills. The gap is between what the organization knows and what employees actually do in their daily work." },
    };
    const rec = seciRecs[weakest[0]];
    recs.push({ priority: "High", area: `Knowledge Creation - ${CONSTRUCTS[weakest[0]].label}`, action: rec.action, why: rec.why, impact: `Knowledge Creation has the strongest influence on Organizational Learning (84% influence) and a significant effect on Employee Innovativeness (49% influence). Fixing this area creates ripple effects throughout your entire organization.` });
  }
  if (scores.OL < BENCHMARKS.OL) {
    recs.push({ priority: "High", area: "Organizational Learning", action: "Establish regular training programs, cross-project learning workshops, and knowledge evaluation systems. Budget for conference attendance and continuing education. Create both formal (courses, certifications) and informal (self-directed, peer learning) development paths.", why: "Your learning systems are below average. Employees do not have enough structured or informal opportunities to grow their skills and knowledge.", impact: "Organizational Learning directly drives Employee Innovativeness (49% influence). Better learning programs give employees the skills and confidence to try new approaches." });
  }
  if (scores.EI < BENCHMARKS.EI) {
    recs.push({ priority: "Critical", area: "Employee Innovativeness", action: "Create innovation reward systems, allocate dedicated time for experimentation, reduce negative consequences for trying new things that do not work out, and appoint innovation champions within project teams.", why: "Your employees are not generating enough new ideas or finding better ways to work. This could be because they lack the knowledge, the opportunity, or the confidence to innovate.", impact: "This is your most important lever. Employee Innovativeness has the single strongest effect on business performance (75% influence). Even small improvements here translate into meaningful financial and market results." });
  }
  if (scores.SBP < BENCHMARKS.SBP) {
    recs.push({ priority: "Medium", area: "Sustainable Business Performance", action: "Focus your efforts upstream on improving Knowledge Creation, Learning, and Innovativeness. Business performance is an outcome that improves when these capabilities are strengthened.", why: "Your business results (profits, market share, client satisfaction) are below average. However, business performance is driven by the other three capabilities in this model, not by targeting performance metrics directly.", impact: "The research shows that business performance improvements come from building stronger capabilities first. Trying to improve profits without improving innovation is like trying to harvest without planting." });
  }
  if (strongest[1] >= 3.5 || scores.KCC >= BENCHMARKS.KCC) {
    const sLabel = scores.KCC >= BENCHMARKS.KCC ? "Knowledge Creation" : CONSTRUCTS[strongest[0]].label;
    recs.push({ priority: "Strength", area: `Build on: ${sLabel}`, action: `This is a competitive advantage for your organization. Continue investing here and use it as a foundation to strengthen weaker areas.`, why: `Your ${sLabel.toLowerCase()} practices are above average. This means you have a working foundation that other improvements can build upon.`, impact: "Organizations that leverage their strengths while addressing weaknesses improve faster than those that only focus on problems." });
  }
  if (recs.length === 0) {
    recs.push({ priority: "Maintain", area: "All Areas Above Average", action: "Your organization performs above the industry benchmark across all dimensions. Focus on sustaining these capabilities and exploring advanced innovation strategies.", why: "Strong performance across knowledge creation, learning, innovation, and business outcomes indicates a well-functioning organizational system.", impact: "Continue investing in the full capability chain to maintain and extend your competitive advantage." });
  }
  return recs;
};

const getInvestmentPriority = (scores) => {
  const areas = [
    { key: "KCC", label: "Knowledge Creation", score: scores.KCC, benchmark: BENCHMARKS.KCC, downstream: PATH_COEFFICIENTS.KCC_OL + PATH_COEFFICIENTS.KCC_EI, explanation: "Affects both Organizational Learning and Employee Innovativeness" },
    { key: "OL", label: "Organizational Learning", score: scores.OL, benchmark: BENCHMARKS.OL, downstream: PATH_COEFFICIENTS.OL_EI, explanation: "Directly drives Employee Innovativeness" },
    { key: "EI", label: "Employee Innovativeness", score: scores.EI, benchmark: BENCHMARKS.EI, downstream: PATH_COEFFICIENTS.EI_SBP, explanation: "Strongest direct driver of Business Performance" },
  ];
  return areas.map((a) => {
    const gap = Math.max(0, a.benchmark - a.score);
    const priority = gap * a.downstream;
    const status = a.score >= a.benchmark ? "above" : "below";
    return { ...a, gap, priority, status };
  }).sort((a, b) => b.priority - a.priority);
};

export default function App() {
  const [page, setPage] = useState("intro");
  const [responses, setResponses] = useState({});
  const [currentSection, setCurrentSection] = useState(0);

  const totalItems = Object.values(CONSTRUCTS).reduce((s, c) => s + c.items.length, 0);
  const answered = Object.keys(responses).length;

  const scores = useMemo(() => {
    if (answered < totalItems) return null;
    const calc = (key) => weightedScore(CONSTRUCTS[key].items, responses);
    const sub = {};
    sectionKeys.forEach((s) => (sub[s] = calc(s)));
    const seciKeys = ["SOC", "EXT", "COM", "INT"];
    const seciLoadings = [0.787, 0.865, 0.760, 0.850];
    let kn = 0, kd = 0;
    seciKeys.forEach((k, i) => { kn += seciLoadings[i] * sub[k]; kd += seciLoadings[i]; });
    sub.KCC = kn / kd;
    return sub;
  }, [responses, answered]);

  // INTRO PAGE
  if (page === "intro") {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "0 auto", padding: 24, color: "#0f172a" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Organizational Capability Assessment</h1>
          <h2 style={{ fontSize: 14, margin: 0, color: "#64748b", fontWeight: 400 }}>For Architecture, Engineering & Construction Organizations</h2>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 14, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>What is this tool?</h3>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>
            This assessment helps your organization understand how well it creates knowledge, learns from experience, encourages employee innovation, and achieves sustainable business results. Based on research studying 226 construction firms, it identifies your strengths and weaknesses and gives specific recommendations for improvement.
          </p>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 14, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>What you will get</h3>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: "0 0 8px" }}>After answering 31 questions (about 10 minutes), you receive:</p>
          <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
            <div>- Scores for four key organizational capabilities</div>
            <div>- Comparison against industry benchmarks from 226 firms</div>
            <div>- A visual map showing how your capabilities influence each other</div>
            <div>- Prioritized recommendations with specific action steps</div>
            <div>- An investment priority analysis showing where to focus first</div>
          </div>
        </div>
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 20, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>Who should fill this out?</h3>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>
            This assessment is best completed by someone with a broad view of the organization: executives, senior managers, project directors, or department heads who can speak to company-wide practices.
          </p>
        </div>
        <button onClick={() => setPage("survey")} style={{ width: "100%", padding: "14px 0", background: COLORS.KCC, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          Start Assessment
        </button>
      </div>
    );
  }

  // SURVEY PAGE
  if (page === "survey") {
    const sKey = sectionKeys[currentSection];
    const sec = CONSTRUCTS[sKey];
    const secDone = sec.items.filter((it) => responses[it.code] !== undefined).length;
    const canNext = secDone === sec.items.length;
    const isLast = currentSection === sectionKeys.length - 1;

    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "0 auto", padding: 24, color: "#0f172a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "#64748b" }}>Section {currentSection + 1} of {sectionKeys.length}</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>{answered}/{totalItems} items</span>
        </div>
        <div style={{ height: 5, background: "#e2e8f0", borderRadius: 3, marginBottom: 20 }}>
          <div style={{ width: `${(answered / totalItems) * 100}%`, height: "100%", background: COLORS.KCC, borderRadius: 3, transition: "width 0.3s" }} />
        </div>
        <h2 style={{ fontSize: 18, margin: "0 0 4px" }}>{sec.label}</h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 4px", lineHeight: 1.4 }}>{sec.plain}</p>
        {sec.parent && <span style={{ fontSize: 11, color: COLORS.KCC, background: COLORS.KCCLight, padding: "2px 8px", borderRadius: 4 }}>Part of Knowledge Creation Capability</span>}
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "12px 0 16px" }}>Rate each statement: 1 = Strongly Disagree, 5 = Strongly Agree</p>
        {sec.items.map((item) => (
          <div key={item.code} style={{ background: responses[item.code] ? "#f0fdf4" : "#fafafa", border: "1px solid", borderColor: responses[item.code] ? "#a7f3d0" : "#e2e8f0", borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{item.code}</div>
            <div style={{ fontSize: 14, color: "#0f172a", marginBottom: 12, lineHeight: 1.5 }}>{item.text}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "#94a3b8", width: 60 }}>Disagree</span>
              {[1, 2, 3, 4, 5].map((v) => <LikertButton key={v} value={v} selected={responses[item.code] === v} onClick={(val) => setResponses((p) => ({ ...p, [item.code]: val }))} />)}
              <span style={{ fontSize: 10, color: "#94a3b8", width: 40, textAlign: "right" }}>Agree</span>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          {currentSection > 0 && <button onClick={() => setCurrentSection((p) => p - 1)} style={{ flex: 1, padding: "12px 0", background: "#fff", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Previous</button>}
          <button onClick={() => { if (isLast && canNext) setPage("results"); else if (canNext) setCurrentSection((p) => p + 1); }} disabled={!canNext} style={{ flex: 1, padding: "12px 0", background: canNext ? COLORS.KCC : "#94a3b8", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: canNext ? "pointer" : "not-allowed" }}>{isLast ? "View Results" : "Next Section"}</button>
        </div>
      </div>
    );
  }

  // RESULTS PAGE
  if (page === "results" && scores) {
    const recs = getRecommendations(scores);
    const priorities = getInvestmentPriority(scores);
    const pathWeights = [PATH_COEFFICIENTS.EI_SBP, PATH_COEFFICIENTS.KCC_OL, PATH_COEFFICIENTS.KCC_EI, PATH_COEFFICIENTS.OL_EI];
    const tw = pathWeights.reduce((a, b) => a + b, 0);
    const cw = { KCC: (PATH_COEFFICIENTS.KCC_OL + PATH_COEFFICIENTS.KCC_EI) / tw, OL: PATH_COEFFICIENTS.OL_EI / tw, EI: PATH_COEFFICIENTS.EI_SBP / tw, SBP: 0.15 };
    const wt = cw.KCC + cw.OL + cw.EI + cw.SBP;
    const overall = (cw.KCC * scores.KCC + cw.OL * scores.OL + cw.EI * scores.EI + cw.SBP * scores.SBP) / wt;
    const bOverall = (cw.KCC * BENCHMARKS.KCC + cw.OL * BENCHMARKS.OL + cw.EI * BENCHMARKS.EI + cw.SBP * BENCHMARKS.SBP) / wt;
    const oR = getRating(overall);

    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: 24, color: "#0f172a" }}>
        <h1 style={{ fontSize: 20, margin: "0 0 4px", textAlign: "center" }}>Organizational Diagnostic Report</h1>
        <p style={{ fontSize: 12, color: "#64748b", textAlign: "center", margin: "0 0 24px" }}>Benchmarked against 226 AEC firms</p>

        {/* Overall */}
        <div style={{ background: oR.bg, borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 20, border: `1px solid ${oR.color}30` }}>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Overall Capability Index</div>
          <div style={{ fontSize: 38, fontWeight: 800, color: oR.color }}>{overall.toFixed(2)}<span style={{ fontSize: 16, fontWeight: 400 }}> / 5.00</span></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: oR.color, marginTop: 6 }}>{oR.label}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Industry benchmark: {bOverall.toFixed(2)}</div>
        </div>

        {/* How to read */}
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginBottom: 20, border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>How to read this report</h3>
          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
            <p style={{ margin: "0 0 8px" }}><strong>Your scores</strong> range from 1.00 to 5.00, where higher is better. Each score is compared against an <strong>industry average</strong> (the dark vertical line on the bar charts) calculated from 226 construction firms.</p>
            <p style={{ margin: "0 0 8px" }}><strong>The Overall Capability Index</strong> is a weighted average of your four scores. It gives more weight to capabilities that have stronger influence on business results. Knowledge Creation and Employee Innovativeness carry the most weight because research shows they have the biggest downstream impact.</p>
            <p style={{ margin: "0 0 8px" }}><strong>Ratings:</strong> Excellent (4.2+) means top-performing among peers. Good (3.5 to 4.2) means above average. Moderate (2.8 to 3.5) means room for improvement. Needs Improvement (below 2.8) requires urgent attention.</p>
            <p style={{ margin: 0 }}><strong>The path diagram</strong> below shows how your four capabilities connect. The percentages indicate how strongly one capability drives another. For example, 75% between Employee Innovativeness and Business Performance means innovativeness is a very strong predictor of business results.</p>
          </div>
        </div>

        {/* Model */}
        <h3 style={{ fontSize: 15, margin: "0 0 8px" }}>How Your Capabilities Connect</h3>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", lineHeight: 1.4 }}>Arrows show the direction of influence. Numbers represent the strength of that relationship based on research data from 226 firms.</p>
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: 12, border: "1px solid #e2e8f0", marginBottom: 20 }}>
          <ModelDiagram scores={scores} />
        </div>

        {/* Path explanations */}
        <h3 style={{ fontSize: 15, margin: "0 0 8px" }}>What the Connections Mean for Your Organization</h3>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", lineHeight: 1.4 }}>The influence percentage tells you how much improving one area will affect another. Higher percentages mean stronger cause-and-effect relationships.</p>
        <PathExplainer from="Knowledge Creation" to="Organizational Learning" coeff={0.839} plain="This is the strongest connection in the model. When your organization gets better at creating and sharing knowledge (through meetings, documentation, databases, and hands-on application), your learning systems become significantly more effective. Think of knowledge creation as the fuel that powers your learning engine." />
        <PathExplainer from="Knowledge Creation" to="Employee Innovativeness" coeff={0.485} plain="When employees have access to better knowledge through your organization's processes (sharing experiences, documenting solutions, integrating information, applying in practice), they become more innovative. Knowledge gives people the raw material they need to come up with new ideas." />
        <PathExplainer from="Organizational Learning" to="Employee Innovativeness" coeff={0.487} plain="Training programs, workshops, and development opportunities directly boost employee innovation. When people learn new skills and approaches, they gain both the ability and the confidence to try new things at work." />
        <PathExplainer from="Employee Innovativeness" to="Business Performance" coeff={0.754} plain="This is the most important finding for your bottom line. Innovative employees are by far the strongest driver of sustainable business results, including financial stability, market growth, and client satisfaction. This is where organizational capabilities turn into real-world results." />

        {/* Scores */}
        <h3 style={{ fontSize: 15, margin: "24px 0 8px" }}>Your Detailed Scores</h3>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>The dark vertical line on each bar represents the industry average from 226 firms.</p>
        <ScoreCard label="Knowledge Creation Capability (KCC)" plain="Overall ability to create and manage knowledge across your organization. Calculated from four sub-scores below, weighted by research-validated importance." score={scores.KCC} benchmark={BENCHMARKS.KCC} color={COLORS.KCC} lightColor={COLORS.KCCLight} />
        <div style={{ paddingLeft: 16, borderLeft: `3px solid ${COLORS.KCCLight}`, marginBottom: 16 }}>
          {["SOC", "EXT", "COM", "INT"].map((k) => (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
                <div><span style={{ fontWeight: 600 }}>{CONSTRUCTS[k].label}</span><span style={{ color: "#94a3b8", marginLeft: 6 }}>{CONSTRUCTS[k].plain}</span></div>
                <span style={{ fontWeight: 700, color: COLORS.KCC, minWidth: 36, textAlign: "right" }}>{scores[k].toFixed(2)}</span>
              </div>
              <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${(scores[k] / 5) * 100}%`, height: "100%", background: COLORS.KCC, borderRadius: 4, opacity: 0.6 }} />
              </div>
            </div>
          ))}
        </div>
        <ScoreCard label="Organizational Learning (OL)" plain={CONSTRUCTS.OL.plain} score={scores.OL} benchmark={BENCHMARKS.OL} color={COLORS.OL} lightColor={COLORS.OLLight} />
        <ScoreCard label="Employee Innovativeness (EI)" plain={CONSTRUCTS.EI.plain} score={scores.EI} benchmark={BENCHMARKS.EI} color={COLORS.EI} lightColor={COLORS.EILight} />
        <ScoreCard label="Sustainable Business Performance (SBP)" plain={CONSTRUCTS.SBP.plain} score={scores.SBP} benchmark={BENCHMARKS.SBP} color={COLORS.SBP} lightColor={COLORS.SBPLight} />

        {/* Investment Priority */}
        <h3 style={{ fontSize: 15, margin: "24px 0 8px" }}>Where to Invest First</h3>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", lineHeight: 1.4 }}>
          This ranking combines two factors: how far each area is from the industry benchmark, and how much influence that area has on downstream outcomes. Areas with a large gap and strong downstream influence should be addressed first for maximum organizational impact.
        </p>
        {priorities.map((p, i) => (
          <div key={p.key} style={{ background: p.status === "below" ? "#fefce8" : "#f8fafc", borderRadius: 10, padding: 14, border: `1px solid ${p.status === "below" ? "#fde68a" : "#e2e8f0"}`, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 && p.gap > 0 ? COLORS.SBP : "#475569", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{p.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: p.status === "above" ? "#065f46" : "#92400e" }}>
                {p.status === "above" ? "Above average" : `${p.gap.toFixed(2)} below average`}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, marginBottom: 4 }}>
              <strong>Downstream influence:</strong> {p.explanation}. Combined influence strength: {(p.downstream * 100).toFixed(0)}%.
            </div>
            {p.gap > 0 ? (
              <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.4 }}>
                Closing this gap would have a {p.priority > 0.5 ? "high" : p.priority > 0.2 ? "moderate" : "low"} ripple effect on your overall organizational performance.
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#065f46" }}>This is a strength. Maintain current practices and use it as a foundation for improvement in other areas.</div>
            )}
          </div>
        ))}

        {/* Recommendations */}
        <h3 style={{ fontSize: 15, margin: "24px 0 8px" }}>Recommended Actions</h3>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px", lineHeight: 1.4 }}>Based on your scores and the research-validated relationships, here are prioritized recommendations. Start with Critical and High priority items for the biggest impact.</p>
        {recs.map((r, i) => (
          <div key={i} style={{
            background: r.priority === "Critical" ? "#fef2f2" : r.priority === "High" ? "#fffbeb" : r.priority === "Strength" ? "#f0fdf4" : "#f8fafc",
            border: "1px solid", borderColor: r.priority === "Critical" ? "#fecaca" : r.priority === "High" ? "#fde68a" : r.priority === "Strength" ? "#a7f3d0" : "#e2e8f0",
            borderRadius: 10, padding: 16, marginBottom: 12,
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, color: "#fff", background: r.priority === "Critical" ? "#7f1d1d" : r.priority === "High" ? "#92400e" : r.priority === "Strength" ? "#065f46" : "#475569" }}>{r.priority}</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{r.area}</span>
            </div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginBottom: 8 }}><strong>Why this matters:</strong> {r.why}</div>
            <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.5, marginBottom: 8, background: "#fff", padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}><strong>What to do:</strong> {r.action}</div>
            <div style={{ fontSize: 12, color: COLORS.KCC, lineHeight: 1.4 }}><strong>Expected impact:</strong> {r.impact}</div>
          </div>
        ))}

        {/* Methodology */}
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginTop: 20, border: "1px solid #e2e8f0" }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 13 }}>About the methodology</h4>
          <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, margin: "0 0 6px" }}>This tool is based on a study of 226 architecture, engineering, and construction firms. The relationships between capabilities were validated using Structural Equation Modeling (SEM), a statistical method that tests how different factors influence each other. All reported relationships are statistically significant (p &lt; 0.01), meaning there is less than a 1% probability they occurred by chance.</p>
          <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, margin: "0 0 6px" }}>Scores are calculated using factor-loading-weighted averages. Survey items that are stronger indicators of their construct carry more weight in your score. This produces more accurate measurements than simple averages.</p>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Model fit: chi-sq/df=1.830, CFI=0.926, TLI=0.919, RMSEA=0.061. Benchmarks from sample means (n=226).</p>
        </div>

        <button onClick={() => { setPage("intro"); setResponses({}); setCurrentSection(0); }} style={{ width: "100%", padding: "12px 0", marginTop: 20, background: "#fff", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Start New Assessment</button>
      </div>
    );
  }
  return null;
}