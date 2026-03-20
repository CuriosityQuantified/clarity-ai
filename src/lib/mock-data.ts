export interface DocumentMeta {
  id: string;
  title: string;
  authors: string[];
  date: string;
  source: string;
  journal: string;
  readingTime: string;
  doi: string;
}

export interface DocumentSection {
  id: string;
  heading: string;
  content: string;
}

export interface VerificationResult {
  quote: string;
  sourceUrl: string;
  sourceName: string;
  confidence: number;
  confidenceLabel: string;
  verifiedAt: string;
  methodology: string;
  relatedFindings: string[];
}

export const mockDocument: { meta: DocumentMeta; sections: DocumentSection[] } = {
  meta: {
    id: "doc-001",
    title: "The Impact of AI on Healthcare: A Comprehensive Review",
    authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez", "Dr. Aisha Patel"],
    date: "2025-11-15",
    source: "Nature Medicine",
    journal: "Nature Medicine, Vol. 31, Issue 11",
    readingTime: "24 min read",
    doi: "10.1038/s41591-025-03892-1",
  },
  sections: [
    {
      id: "abstract",
      heading: "Abstract",
      content:
        "Artificial intelligence (AI) has emerged as a transformative force in healthcare, with applications spanning diagnostics, treatment planning, drug discovery, and patient management. This comprehensive review examines the current state of AI integration in clinical settings, evaluating both the demonstrated benefits and the challenges that remain. Our analysis of 847 peer-reviewed studies published between 2020 and 2025 reveals that AI-assisted diagnostic systems have achieved an average accuracy improvement of 23.4% across multiple medical specialties, with particularly significant gains in radiology (31.2%), pathology (27.8%), and dermatology (25.1%). However, critical challenges persist in areas of algorithmic bias, data privacy, clinical validation, and regulatory frameworks. We propose a structured approach for responsible AI deployment that balances innovation with patient safety.",
    },
    {
      id: "introduction",
      heading: "1. Introduction",
      content:
        'The integration of artificial intelligence into healthcare represents one of the most significant technological shifts in modern medicine. Since the early demonstrations of deep learning applications in medical imaging circa 2016, the field has rapidly evolved from proof-of-concept studies to deployed clinical systems serving millions of patients worldwide.\n\nThe global healthcare AI market, valued at $15.4 billion in 2022, is projected to reach $187.6 billion by 2030, reflecting a compound annual growth rate of 37.5%. This explosive growth is driven by several converging factors: the exponential increase in available medical data, advances in computational infrastructure, and the pressing need to address healthcare workforce shortages that affect an estimated 80% of countries globally.\n\nTraditional healthcare systems face mounting pressures from aging populations, rising chronic disease prevalence, and increasing costs. In the United States alone, healthcare expenditure reached $4.5 trillion in 2024, accounting for approximately 17.3% of GDP. AI technologies offer the potential to address these challenges through improved efficiency, earlier disease detection, and more personalized treatment approaches.\n\nThis review provides a systematic examination of AI applications across the healthcare continuum, from primary prevention and screening through diagnosis, treatment, and long-term management. We synthesize findings from 847 studies to present a balanced assessment of where AI is delivering measurable clinical value and where significant gaps remain.',
    },
    {
      id: "diagnostics",
      heading: "2. AI in Diagnostics",
      content:
        "Diagnostic applications represent the most mature domain of healthcare AI, with several systems now approved by regulatory bodies including the FDA, EMA, and PMDA. Our analysis identifies three primary categories of diagnostic AI: medical imaging analysis, laboratory diagnostics, and clinical decision support systems.\n\nIn medical imaging, convolutional neural networks (CNNs) and vision transformers have demonstrated remarkable capability in identifying pathological patterns across multiple modalities. A landmark multi-center trial involving 14,532 patients across 23 hospitals demonstrated that AI-assisted mammography interpretation reduced false-negative rates by 31.2% while simultaneously decreasing false-positive rates by 12.4%, resulting in a net improvement in diagnostic accuracy that exceeded human-only interpretation by a statistically significant margin (p < 0.001).\n\nIn pathology, AI systems analyzing whole-slide images have shown particular promise in cancer grading and biomarker quantification. The PathAI-validated algorithm for prostate cancer Gleason grading achieved concordance rates of 94.3% with expert pathologists, while processing each slide in an average of 2.3 seconds compared to the typical 8-12 minutes required for manual review.\n\nClinical decision support systems (CDSS) powered by machine learning have been deployed in emergency departments to assist with triage and risk stratification. The EPIC Sepsis Prediction Model, despite initial controversy regarding its real-world performance, has undergone significant refinement. Updated versions deployed across 127 hospitals demonstrated a 18.7% reduction in sepsis-related mortality when combined with standardized clinical response protocols.",
    },
    {
      id: "treatment",
      heading: "3. AI in Treatment Planning",
      content:
        "AI-driven treatment planning has advanced significantly in oncology, where the complexity of treatment decisions and the volume of relevant clinical data make it an ideal application domain. Reinforcement learning models trained on longitudinal treatment outcome data have demonstrated the ability to recommend chemotherapy regimens that outperform standard-of-care protocols in retrospective analyses.\n\nIn radiation oncology, AI systems now routinely assist with treatment planning, reducing the time required to generate optimal radiation dose distributions from several hours to minutes. A randomized controlled trial at Memorial Sloan Kettering Cancer Center found that AI-generated radiation plans were preferred by clinical experts in 72% of cases when compared blindly against plans created by experienced dosimetrists.\n\nPrecision medicine represents another area where AI is making significant contributions. Pharmacogenomic models that integrate genetic variants, drug interaction databases, and patient clinical histories can predict medication response with accuracy rates exceeding 85% for certain drug classes, particularly in psychiatry and cardiology. These systems have been shown to reduce adverse drug events by 22% in pilot implementations.\n\nSurgical applications of AI include preoperative planning using 3D reconstruction from medical imaging, intraoperative guidance systems, and robotic-assisted procedures. The da Vinci surgical system, enhanced with AI-powered tissue recognition, has demonstrated a 15% reduction in operative complications in a meta-analysis of 12,847 procedures across urologic, gynecologic, and general surgery applications.",
    },
    {
      id: "drug-discovery",
      heading: "4. AI in Drug Discovery",
      content:
        "The pharmaceutical industry has rapidly adopted AI technologies to accelerate and improve the drug discovery pipeline. Traditional drug development timelines of 10-15 years and costs exceeding $2.6 billion per approved drug have created an urgent need for more efficient approaches.\n\nAI-driven molecular design using generative models has emerged as a particularly promising approach. AlphaFold's revolutionary protein structure prediction capability, which achieved atomic-level accuracy for over 200 million protein structures, has fundamentally transformed structure-based drug design. Subsequent tools including RoseTTAFold and ESMFold have extended these capabilities, enabling researchers to rapidly identify potential drug binding sites and design molecules with optimized pharmacological properties.\n\nIn clinical trial optimization, AI systems are being used to identify optimal patient populations, predict enrollment challenges, and design adaptive trial protocols. Bayesian optimization algorithms have reduced average Phase II trial durations by 28% while maintaining statistical power, representing potential savings of hundreds of millions of dollars per successful drug program.\n\nNotably, the first AI-designed drug to enter Phase II clinical trials, INS018_055 for idiopathic pulmonary fibrosis, demonstrated favorable safety profiles and preliminary efficacy signals. As of late 2025, over 30 AI-discovered drug candidates are in various stages of clinical development, with several approaching Phase III trials.",
    },
    {
      id: "challenges",
      heading: "5. Challenges and Limitations",
      content:
        'Despite the promising advances outlined above, several critical challenges must be addressed before AI can achieve its full potential in healthcare. Algorithmic bias remains a persistent concern, with multiple studies demonstrating that AI systems trained predominantly on data from specific demographic groups may perform poorly when applied to underrepresented populations. A comprehensive audit of 64 FDA-approved AI medical devices found that only 37% had been validated across diverse racial and ethnic groups.\n\nData privacy and security present additional challenges, particularly as AI systems require access to large volumes of sensitive patient data for training and operation. The tension between data accessibility for AI development and patient privacy protections continues to generate regulatory and ethical debates.\n\nClinical validation standards for AI systems remain inconsistent across jurisdictions. While the FDA has approved over 800 AI-enabled medical devices as of 2025, the regulatory framework continues to evolve, with ongoing discussions about requirements for continuous monitoring of AI performance in real-world settings.\n\nThe "black box" problem, whereby complex AI models produce outputs without transparent reasoning, remains a significant barrier to clinical adoption. While explainable AI (XAI) techniques have advanced considerably, achieving the level of interpretability required for high-stakes medical decisions remains an active area of research.\n\nFinally, workforce integration challenges persist. Studies indicate that while 78% of physicians express willingness to use AI tools, only 34% feel adequately trained to critically evaluate AI-generated recommendations, highlighting a significant education gap that must be addressed alongside technological deployment.',
    },
    {
      id: "conclusion",
      heading: "6. Conclusion",
      content:
        "This comprehensive review demonstrates that AI has achieved meaningful clinical impact across multiple healthcare domains, with particularly strong evidence supporting its role in diagnostic imaging, treatment planning, and drug discovery acceleration. The 23.4% average improvement in diagnostic accuracy identified across our analysis of 847 studies represents a clinically significant advance that, when properly implemented, can translate to improved patient outcomes.\n\nHowever, realizing the full potential of healthcare AI requires a concerted effort to address existing challenges in bias mitigation, regulatory standardization, clinical validation, and workforce preparation. We recommend a phased approach to AI integration that prioritizes domains where evidence of clinical benefit is strongest, while simultaneously investing in the foundational infrastructure, regulatory frameworks, and educational programs necessary to support broader adoption.\n\nThe next decade will likely see AI transition from a supplementary tool to an integral component of healthcare delivery. Ensuring this transition serves all patients equitably and safely is perhaps the defining challenge of modern healthcare technology.",
    },
  ],
};

export const mockVerifications: Record<string, VerificationResult> = {
  default: {
    quote:
      "AI-assisted diagnostic systems have achieved an average accuracy improvement of 23.4% across multiple medical specialties",
    sourceUrl: "https://doi.org/10.1038/s41591-025-03892-1",
    sourceName: "Nature Medicine, 2025",
    confidence: 94,
    confidenceLabel: "High Confidence",
    verifiedAt: "2025-11-15T14:32:00Z",
    methodology:
      "Meta-analysis of 847 peer-reviewed studies with cross-validation against independent datasets",
    relatedFindings: [
      "Radiology AI showed 31.2% improvement in diagnostic accuracy",
      "Pathology AI achieved 94.3% concordance with expert pathologists",
      "Emergency department CDSS reduced sepsis mortality by 18.7%",
    ],
  },
  diagnostics: {
    quote:
      "AI-assisted mammography interpretation reduced false-negative rates by 31.2% while simultaneously decreasing false-positive rates by 12.4%",
    sourceUrl: "https://doi.org/10.1016/j.radiol.2025.04.012",
    sourceName: "Radiology, 2025",
    confidence: 97,
    confidenceLabel: "Very High Confidence",
    verifiedAt: "2025-11-10T09:15:00Z",
    methodology:
      "Multi-center randomized controlled trial across 23 hospitals with 14,532 patients",
    relatedFindings: [
      "Study met primary and all secondary endpoints",
      "Results consistent across all demographic subgroups",
      "AI system reduced radiologist reading time by 44%",
    ],
  },
  treatment: {
    quote:
      "AI-generated radiation plans were preferred by clinical experts in 72% of cases when compared blindly against plans created by experienced dosimetrists",
    sourceUrl: "https://doi.org/10.1200/JCO.2025.43.1289",
    sourceName: "Journal of Clinical Oncology, 2025",
    confidence: 89,
    confidenceLabel: "High Confidence",
    verifiedAt: "2025-10-28T16:45:00Z",
    methodology:
      "Randomized controlled trial at Memorial Sloan Kettering with blinded expert evaluation",
    relatedFindings: [
      "Planning time reduced from hours to minutes",
      "Dose distribution uniformity improved by 18%",
      "Patient outcomes comparable at 12-month follow-up",
    ],
  },
  "drug-discovery": {
    quote:
      "AlphaFold achieved atomic-level accuracy for over 200 million protein structures",
    sourceUrl: "https://doi.org/10.1038/s41586-024-07487-w",
    sourceName: "Nature, 2024",
    confidence: 99,
    confidenceLabel: "Very High Confidence",
    verifiedAt: "2025-11-01T11:20:00Z",
    methodology:
      "Independent validation against experimentally determined crystal structures from the Protein Data Bank",
    relatedFindings: [
      "Structures freely available in the AlphaFold Protein Structure Database",
      "Over 1 million researchers have accessed the database",
      "Cited in over 15,000 research publications",
    ],
  },
  challenges: {
    quote:
      "Only 37% of FDA-approved AI medical devices had been validated across diverse racial and ethnic groups",
    sourceUrl: "https://doi.org/10.1001/jama.2025.8924",
    sourceName: "JAMA, 2025",
    confidence: 91,
    confidenceLabel: "High Confidence",
    verifiedAt: "2025-11-05T13:00:00Z",
    methodology:
      "Systematic audit of all 800+ FDA-approved AI medical devices with analysis of validation study demographics",
    relatedFindings: [
      "Disparities most pronounced in dermatology AI systems",
      "FDA has proposed new diversity requirements for AI device submissions",
      "Industry consortium formed to address training data diversity",
    ],
  },
};

export const documentList = [
  {
    id: "doc-001",
    title: "The Impact of AI on Healthcare",
    authors: ["Chen, S.", "Rodriguez, M.", "Patel, A."],
    date: "2025-11-15",
    source: "Nature Medicine",
    active: true,
  },
  {
    id: "doc-002",
    title: "Quantum Computing in Drug Discovery",
    authors: ["Williams, J.", "Kim, H."],
    date: "2025-10-02",
    source: "Science",
    active: false,
  },
  {
    id: "doc-003",
    title: "CRISPR Gene Therapy: 5-Year Outcomes",
    authors: ["Thompson, R.", "Garcia, L."],
    date: "2025-09-18",
    source: "The Lancet",
    active: false,
  },
  {
    id: "doc-004",
    title: "Neural Interfaces for Paralysis Recovery",
    authors: ["Nakamura, T.", "Singh, P."],
    date: "2025-08-30",
    source: "NEJM",
    active: false,
  },
  {
    id: "doc-005",
    title: "mRNA Vaccine Platform Advances",
    authors: ["Okonkwo, A.", "Larsson, E."],
    date: "2025-07-22",
    source: "Cell",
    active: false,
  },
];
