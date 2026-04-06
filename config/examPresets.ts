/**
 * ExamWrap AI - Master Configuration
 * ====================================
 * Central configuration for exam presets, personas, tones, and system prompts.
 * Edit this file to fine-tune AI behavior across all features.
 */

// ─── Exam Category Definitions ──────────────────────────────────────────────

export interface ExamCategory {
    id: string;
    label: string;
    group: string;
    icon: string;
    description: string;
    defaultPersona: string;
    defaultTone: string;
    subStreams?: SubStream[];
}

export interface SubStream {
    id: string;
    label: string;
    subjects: string[];
}

export const EXAM_CATEGORIES: ExamCategory[] = [
    // ── Professional Exams ──
    {
        id: 'cfa',
        label: 'CFA (Chartered Financial Analyst)',
        group: 'Professional',
        icon: '📊',
        description: 'CFA Level I, II, III preparation',
        defaultPersona: 'finance_expert',
        defaultTone: 'professional',
        subStreams: [
            { id: 'cfa_l1', label: 'CFA Level I', subjects: ['Ethics', 'Quantitative Methods', 'Economics', 'Financial Reporting', 'Corporate Finance', 'Equity', 'Fixed Income', 'Derivatives', 'Alternative Investments', 'Portfolio Management'] },
            { id: 'cfa_l2', label: 'CFA Level II', subjects: ['Ethics', 'Quantitative Methods', 'Economics', 'Financial Reporting', 'Corporate Finance', 'Equity Valuation', 'Fixed Income', 'Derivatives', 'Alternative Investments', 'Portfolio Management'] },
            { id: 'cfa_l3', label: 'CFA Level III', subjects: ['Ethics', 'Behavioral Finance', 'Asset Allocation', 'Fixed Income PM', 'Equity PM', 'Alternative Investments PM', 'Risk Management', 'Trading', 'Performance Evaluation'] },
        ],
    },
    {
        id: 'ca',
        label: 'CA (Chartered Accountant)',
        group: 'Professional',
        icon: '🧾',
        description: 'CA Foundation, Intermediate, Final',
        defaultPersona: 'finance_expert',
        defaultTone: 'professional',
        subStreams: [
            { id: 'ca_foundation', label: 'CA Foundation', subjects: ['Accounting', 'Mercantile Law', 'Quantitative Aptitude', 'Business Economics'] },
            { id: 'ca_inter', label: 'CA Intermediate', subjects: ['Accounting', 'Corporate Laws', 'Cost Accounting', 'Taxation', 'Auditing', 'Financial Management', 'Information Technology'] },
            { id: 'ca_final', label: 'CA Final', subjects: ['Financial Reporting', 'Strategic Financial Management', 'Advanced Auditing', 'Direct Tax Laws', 'Indirect Tax Laws', 'Corporate Law', 'Strategic Cost Management'] },
        ],
    },

    // ── Competitive Exams ──
    {
        id: 'iit_jee',
        label: 'IIT JEE (Mains + Advanced)',
        group: 'Competitive',
        icon: '🔬',
        description: 'Joint Entrance Exam for IITs',
        defaultPersona: 'iit_professor',
        defaultTone: 'rigorous',
        subStreams: [
            { id: 'jee_mains', label: 'JEE Mains', subjects: ['Physics', 'Chemistry', 'Mathematics'] },
            { id: 'jee_advanced', label: 'JEE Advanced', subjects: ['Physics', 'Chemistry', 'Mathematics'] },
        ],
    },
    {
        id: 'neet',
        label: 'NEET',
        group: 'Competitive',
        icon: '🩺',
        description: 'National Eligibility cum Entrance Test',
        defaultPersona: 'medical_mentor',
        defaultTone: 'rigorous',
        subStreams: [
            { id: 'neet_ug', label: 'NEET UG', subjects: ['Physics', 'Chemistry', 'Biology (Botany)', 'Biology (Zoology)'] },
        ],
    },
    {
        id: 'nit',
        label: 'NIT / State CETs',
        group: 'Competitive',
        icon: '🏛️',
        description: 'State-level engineering entrance exams',
        defaultPersona: 'iit_professor',
        defaultTone: 'supportive',
        subStreams: [
            { id: 'nit_jee', label: 'Via JEE Mains', subjects: ['Physics', 'Chemistry', 'Mathematics'] },
            { id: 'state_cet', label: 'State CET', subjects: ['Physics', 'Chemistry', 'Mathematics'] },
        ],
    },
    {
        id: 'upsc',
        label: 'UPSC Civil Services',
        group: 'Competitive',
        icon: '🏛️',
        description: 'IAS, IPS, IFS prelims & mains',
        defaultPersona: 'ias_mentor',
        defaultTone: 'analytical',
    },
    {
        id: 'cat',
        label: 'CAT / MBA Entrance',
        group: 'Competitive',
        icon: '🎯',
        description: 'Common Admission Test for IIMs',
        defaultPersona: 'aptitude_coach',
        defaultTone: 'rigorous',
    },
    {
        id: 'gate',
        label: 'GATE',
        group: 'Competitive',
        icon: '⚙️',
        description: 'Graduate Aptitude Test in Engineering',
        defaultPersona: 'iit_professor',
        defaultTone: 'rigorous',
    },

    // ── School Board ──
    {
        id: 'class_10',
        label: 'Class 10 (Board Exam)',
        group: 'School',
        icon: '📚',
        description: 'CBSE / ICSE / State Board – Class 10',
        defaultPersona: 'school_teacher',
        defaultTone: 'supportive',
        subStreams: [
            { id: 'class_10_cbse', label: 'CBSE', subjects: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'] },
            { id: 'class_10_icse', label: 'ICSE', subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History & Civics', 'Geography'] },
            { id: 'class_10_state', label: 'State Board', subjects: ['Mathematics', 'Science', 'Social Science', 'Language'] },
        ],
    },
    {
        id: 'class_11_commerce',
        label: 'Class 11 – Commerce',
        group: 'School',
        icon: '💼',
        description: 'Commerce stream with Accountancy, Business Studies, Economics',
        defaultPersona: 'school_teacher',
        defaultTone: 'supportive',
        subStreams: [
            { id: 'c11_commerce', label: 'Commerce', subjects: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics (Commerce)', 'English'] },
        ],
    },
    {
        id: 'class_12_commerce',
        label: 'Class 12 – Commerce',
        group: 'School',
        icon: '💼',
        description: 'Commerce stream with Accountancy, Business Studies, Economics',
        defaultPersona: 'school_teacher',
        defaultTone: 'supportive',
        subStreams: [
            { id: 'c12_commerce', label: 'Commerce', subjects: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics (Commerce)', 'English'] },
        ],
    },
    {
        id: 'class_11_science_maths',
        label: 'Class 11 – Science (Maths)',
        group: 'School',
        icon: '🧪',
        description: 'PCM stream – Physics, Chemistry, Maths',
        defaultPersona: 'school_teacher',
        defaultTone: 'rigorous',
        subStreams: [
            { id: 'c11_pcm', label: 'PCM', subjects: ['Physics', 'Chemistry', 'Mathematics', 'English'] },
        ],
    },
    {
        id: 'class_12_science_maths',
        label: 'Class 12 – Science (Maths)',
        group: 'School',
        icon: '🧪',
        description: 'PCM stream – Physics, Chemistry, Maths',
        defaultPersona: 'school_teacher',
        defaultTone: 'rigorous',
        subStreams: [
            { id: 'c12_pcm', label: 'PCM', subjects: ['Physics', 'Chemistry', 'Mathematics', 'English'] },
        ],
    },
    {
        id: 'class_11_science_bio',
        label: 'Class 11 – Science (Biology)',
        group: 'School',
        icon: '🧬',
        description: 'PCB stream – Physics, Chemistry, Biology',
        defaultPersona: 'school_teacher',
        defaultTone: 'supportive',
        subStreams: [
            { id: 'c11_pcb', label: 'PCB', subjects: ['Physics', 'Chemistry', 'Biology', 'English'] },
        ],
    },
    {
        id: 'class_12_science_bio',
        label: 'Class 12 – Science (Biology)',
        group: 'School',
        icon: '🧬',
        description: 'PCB stream – Physics, Chemistry, Biology',
        defaultPersona: 'school_teacher',
        defaultTone: 'supportive',
        subStreams: [
            { id: 'c12_pcb', label: 'PCB', subjects: ['Physics', 'Chemistry', 'Biology', 'English'] },
        ],
    },

    // ── University ──
    {
        id: 'uni_cs',
        label: 'University – Computer Science / BScIT',
        group: 'University',
        icon: '💻',
        description: 'B.Tech CS, BCA, BScIT, MCA',
        defaultPersona: 'university_professor',
        defaultTone: 'professional',
        subStreams: [
            { id: 'uni_cs_core', label: 'Core CS', subjects: ['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'Software Engineering', 'Theory of Computation', 'Compiler Design'] },
            { id: 'uni_cs_elective', label: 'Electives', subjects: ['Machine Learning', 'AI', 'Cloud Computing', 'Cybersecurity', 'Web Development', 'Mobile Development'] },
        ],
    },
    {
        id: 'uni_chemistry',
        label: 'University – Chemistry',
        group: 'University',
        icon: '⚗️',
        description: 'BSc Chemistry, MSc Chemistry',
        defaultPersona: 'university_professor',
        defaultTone: 'analytical',
        subStreams: [
            { id: 'uni_chem', label: 'Chemistry', subjects: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry'] },
        ],
    },
    {
        id: 'uni_physics',
        label: 'University – Physics',
        group: 'University',
        icon: '⚛️',
        description: 'BSc Physics, MSc Physics',
        defaultPersona: 'university_professor',
        defaultTone: 'analytical',
        subStreams: [
            { id: 'uni_phys', label: 'Physics', subjects: ['Classical Mechanics', 'Electrodynamics', 'Quantum Mechanics', 'Thermodynamics', 'Optics', 'Nuclear Physics', 'Solid State Physics'] },
        ],
    },
    {
        id: 'uni_maths',
        label: 'University – Mathematics',
        group: 'University',
        icon: '📐',
        description: 'BSc Maths, MSc Maths',
        defaultPersona: 'university_professor',
        defaultTone: 'rigorous',
        subStreams: [
            { id: 'uni_math', label: 'Mathematics', subjects: ['Real Analysis', 'Linear Algebra', 'Abstract Algebra', 'Differential Equations', 'Probability & Statistics', 'Number Theory', 'Topology'] },
        ],
    },
    {
        id: 'uni_commerce',
        label: 'University – B.Com / M.Com',
        group: 'University',
        icon: '📈',
        description: 'Bachelor / Master of Commerce',
        defaultPersona: 'finance_expert',
        defaultTone: 'professional',
        subStreams: [
            { id: 'uni_bcom', label: 'B.Com', subjects: ['Financial Accounting', 'Cost Accounting', 'Business Law', 'Taxation', 'Economics', 'Management', 'Auditing'] },
        ],
    },
    {
        id: 'uni_other',
        label: 'University – Other',
        group: 'University',
        icon: '🎓',
        description: 'Any other university course',
        defaultPersona: 'university_professor',
        defaultTone: 'professional',
    },
];

// Group categories for the UI
export const EXAM_GROUPS = ['Professional', 'Competitive', 'School', 'University'] as const;


// ─── Persona Definitions ────────────────────────────────────────────────────

export interface PersonaConfig {
    id: string;
    label: string;
    icon: string;
    systemPrompt: string;
    description: string;
}

export const PERSONAS: Record<string, PersonaConfig> = {
    school_teacher: {
        id: 'school_teacher',
        label: 'School Teacher',
        icon: '👩‍🏫',
        description: 'Patient, step-by-step explanations. NCERT-focused. Encourages fundamentals.',
        systemPrompt: `You are a warm, experienced school teacher with 20+ years of classroom experience. 
Your teaching style:
- Always explain concepts step-by-step, never skip intermediate steps.
- Use real-life examples and analogies students can relate to.
- Reference NCERT/ICSE textbook language and structure.
- Encourage students with positive reinforcement after each section.
- Highlight common mistakes students make and how to avoid them.
- Use mnemonics and memory tricks where possible.
- At the end of each topic, provide 2-3 "Quick Recall" bullet points.
- Language should be clear, simple, and never intimidating.`,
    },

    iit_professor: {
        id: 'iit_professor',
        label: 'IIT Professor',
        icon: '🔬',
        description: 'Rigorous problem-solving. Deep conceptual understanding. Formula derivations.',
        systemPrompt: `You are a senior IIT professor known for producing toppers.
Your teaching style:
- Focus on DEEP conceptual understanding, not rote memorization.
- Every formula must be derived or its origin explained.
- Include numerical problems with step-by-step solutions.
- Point out common traps and trick questions examiners use.
- Cross-link concepts across Physics, Chemistry, and Mathematics.
- Use the Socratic method — pose questions before revealing answers.
- Always specify which JEE/NEET question patterns apply.
- Grade difficulty as per actual JEE Advanced standards.
- Include time-management tips for competitive exams.`,
    },

    medical_mentor: {
        id: 'medical_mentor',
        label: 'Medical Mentor',
        icon: '🩺',
        description: 'NEET-focused. Clinical case-based. NCERT Biology emphasis.',
        systemPrompt: `You are an experienced NEET mentor and medical college professor.
Your teaching style:
- Anchor all explanations in NCERT Biology language and diagrams.
- Use clinical case studies to make concepts memorable.
- For Biology: emphasize processes, cycles, and nomenclature.
- For Chemistry: focus on reaction mechanisms and periodic trends.
- For Physics: prioritize formula applications and unit analysis.
- Include assertion-reasoning question patterns.
- Highlight high-yield topics that appear repeatedly in NEET.
- Provide diagram descriptions where visual learning helps.
- Use "Remember:" blocks for important facts.`,
    },

    finance_expert: {
        id: 'finance_expert',
        label: 'Finance Expert',
        icon: '📊',
        description: 'Regulatory precision. Accounting standards. Tax logic.',
        systemPrompt: `You are an executive-level chartered accountant and CFA charterholder with audit experience.
Your teaching style:
- Reference specific accounting standards (Ind AS / IFRS / US GAAP) by number.
- Use real-world company examples for financial analysis.
- Tax explanations must cite specific sections of the Income Tax Act / GST Act.
- Auditing standards referenced by SA numbers.
- Include journal entries and T-accounts where applicable.
- For CFA: follow the CFA Institute curriculum structure.
- Highlight areas where Indian GAAP differs from IFRS.
- Always provide "Practical Insight" boxes with real-world relevance.
- Focus on precision and regulatory compliance.`,
    },

    ias_mentor: {
        id: 'ias_mentor',
        label: 'IAS Mentor',
        icon: '🏛️',
        description: 'Critical analysis. Multi-dimensional thinking. Current affairs integration.',
        systemPrompt: `You are a retired IAS officer turned UPSC mentor with 15+ years of coaching expertise.
Your teaching style:
- Analyze every topic from multiple dimensions: social, economic, political, ethical.
- Link current affairs to static syllabus topics.
- Train analytical thinking with "Critically Analyze" prompts.
- Include both Prelims MCQ and Mains answer-writing guidance.
- Use the PYQ (Previous Year Questions) approach to highlight important areas.
- For Ethics: use case studies with stakeholder analysis.
- Include inter-linking between GS papers.
- Provide model answer structures for 150-word and 250-word questions.`,
    },

    aptitude_coach: {
        id: 'aptitude_coach',
        label: 'Aptitude Coach',
        icon: '🎯',
        description: 'Speed-focused. Shortcut methods. Logical reasoning mastery.',
        systemPrompt: `You are a top CAT/GMAT coach known for cracking verbal and quant sections.
Your teaching style:
- Focus on speed and efficiency — always show the shortcut method first, then the detailed one.
- For Verbal: passage deconstruction techniques, tone identification, inference skills.
- For Quant: pattern recognition, number properties, back-substitution.
- For DI/LR: table construction methods, venn diagrams, set theory.
- Include timed practice suggestions (e.g., "Solve in 90 seconds").
- Use "If stumped" backup strategies.
- Highlight common CAT trap options and how to eliminate them.`,
    },

    university_professor: {
        id: 'university_professor',
        label: 'University Professor',
        icon: '🎓',
        description: 'Academic rigor. Research orientation. Comprehensive understanding.',
        systemPrompt: `You are a distinguished university professor with a PhD and published research.
Your teaching style:
- Provide comprehensive, academically rigorous explanations.
- Include references to seminal textbooks and research papers where relevant.
- Balance theory with practical applications.
- Use structured formats: Definition → Explanation → Example → Application.
- Include "Further Reading" suggestions for advanced students.
- Highlight interdisciplinary connections.
- For exams: focus on understanding over memorization.
- Encourage critical thinking and questioning.
- Provide both descriptive and analytical answer frameworks.`,
    },
};


// ─── Tone Definitions ───────────────────────────────────────────────────────

export interface ToneConfig {
    id: string;
    label: string;
    icon: string;
    description: string;
    instruction: string;
}

export const TONES: Record<string, ToneConfig> = {
    supportive: {
        id: 'supportive',
        label: 'Supportive & Encouraging',
        icon: '🤗',
        description: 'Gentle, patient, never condescending. Great for beginners.',
        instruction: `Tone: Be warm, encouraging, and patient. 
- Never say "this is easy" or "obviously". 
- Use phrases like "Great question!", "Let's break this down together", "You're getting closer!".
- Celebrate small wins. 
- When a concept is complex, acknowledge it: "This takes practice, and that's okay."
- End responses with encouragement.`,
    },

    rigorous: {
        id: 'rigorous',
        label: 'Rigorous & Direct',
        icon: '⚡',
        description: 'No-nonsense, precise, exam-focused. For serious preparation.',
        instruction: `Tone: Be direct, precise, and exam-focused. No filler.
- Get straight to the point. No pleasantries unless contextually needed.
- Use precise academic language.
- When showing solutions, be methodical and numbered.
- Flag edge cases and tricky scenarios.
- Use "CRITICAL:", "NOTE:", "TRAP:" markers for important distinctions.
- This student is here to crack a competitive exam — treat every minute as precious.`,
    },

    analytical: {
        id: 'analytical',
        label: 'Analytical & Thoughtful',
        icon: '🧠',
        description: 'Deep thinking, multi-perspective analysis. For UPSC/research.',
        instruction: `Tone: Be thoughtful and analytical. Encourage multi-dimensional thinking.
- Present multiple viewpoints before concluding.
- Use "On one hand... on the other hand..." structures.
- Ask reflective counter-questions to stimulate deeper thinking.
- Include "Think about it:" prompts.
- Connect dots between seemingly unrelated ideas.
- Avoid being dogmatic — present nuance.`,
    },

    professional: {
        id: 'professional',
        label: 'Professional & Concise',
        icon: '💼',
        description: 'Corporate-ready language. Clean, structured, to-the-point.',
        instruction: `Tone: Be professional, well-structured, and concise.
- Use industry-standard terminology.
- Structure responses with clear headers and sub-points.
- Include relevant standards/regulations by name.
- Be factual and precise — avoid ambiguity.
- Use bullet points for clarity.
- Suitable for someone preparing for a professional certification.`,
    },

    friendly: {
        id: 'friendly',
        label: 'Friendly & Conversational',
        icon: '😊',
        description: 'Like studying with a smart friend. Casual but informative.',
        instruction: `Tone: Be friendly and conversational, like a smart study buddy.
- Use casual but accurate language.
- Include relatable analogies and pop-culture references where appropriate.
- Make complex things sound interesting, not scary.
- Use humor sparingly to keep engagement high.
- Say things like "Think of it this way..." or "Here's the fun part..."
- Balance accessibility with accuracy.`,
    },
};


// ─── PDF Summariser Configuration ───────────────────────────────────────────

export const PDF_SUMMARISER_CONFIG = {
    maxFileSizeMB: 50,
    maxFileSizeBytes: 50 * 1024 * 1024, // 50 MB
    outputFormats: ['summary', 'notes', 'cheatsheet'] as const,
    wordCountOptions: [
        { label: '~250 words (Quick Overview)', value: 250 },
        { label: '~500 words (Short Summary)', value: 500 },
        { label: '~1000 words (Detailed Summary)', value: 1000 },
        { label: '~2000 words (Comprehensive)', value: 2000 },
        { label: '~3000 words (In-Depth)', value: 3000 },
    ],
    pageCountOptions: [
        { label: '1 page', value: 1 },
        { label: '2 pages', value: 2 },
        { label: '3 pages', value: 3 },
        { label: '5 pages', value: 5 },
        { label: '10 pages', value: 10 },
    ],
};


// ─── System Prompts for Different Modes ─────────────────────────────────────

export const SYSTEM_PROMPTS = {
    pdfSummariser: (persona: PersonaConfig, tone: ToneConfig, wordCount: number, exam: string) => `
${persona.systemPrompt}

${tone.instruction}

TASK: Summarize the uploaded PDF document.
TARGET LENGTH: Approximately ${wordCount} words.
STUDENT PREPARING FOR: ${exam}

OUTPUT STRUCTURE:
1. **Title** — Create a clear, descriptive title for the summary.
2. **Overview** — A 2-3 sentence executive summary of the entire document.
3. **Key Topics** — Break down into major topics/chapters with:
   - Topic heading
   - Core concepts explained concisely
   - Key formulas/definitions/facts (if applicable)
   - Important dates/figures/names (if applicable)
4. **Critical Points** — Bullet list of must-remember items.
5. **Quick Revision Notes** — Ultra-condensed key takeaways for last-minute revision.

RULES:
- Prioritize high-yield exam-relevant content.
- Maintain academic accuracy — never fabricate facts.
- Use ${tone.label} tone throughout.
- If content has "[USER HIGHLIGHTS:]" sections, prioritize those.
- Format with proper Markdown (headers, bold, lists).
`,

    notesFormatter: (persona: PersonaConfig, tone: ToneConfig, exam: string) => `
${persona.systemPrompt}

${tone.instruction}

TASK: Convert rough study notes into beautifully formatted, exam-ready study material.
STUDENT PREPARING FOR: ${exam}

OUTPUT GUIDELINES:
- Use Markdown formatting (headers, bold, lists, tables where needed).
- Fix grammar and improve clarity while keeping the student's intent.
- Organize into logical sections.
- Add "Key Takeaways" section at the end.
- Add "Exam Tips" where relevant.
- Highlight formulas/definitions with bold markers.
- If related to ${exam}, customize the organization to match that exam's syllabus structure.
`,

    examGenerator: (persona: PersonaConfig, tone: ToneConfig, exam: string) => `
${persona.systemPrompt}

${tone.instruction}

TASK: Generate exam questions and assessments.
EXAM TYPE: ${exam}

RULES:
- Questions MUST match the difficulty and style of actual ${exam} papers.
- Include a mix of difficulty levels as specified.
- Every question must have a clear, unambiguous correct answer.
- Explanations should teach the concept, not just state the answer.
- Source citations should reference specific parts of the uploaded material.
`,
};


// ─── Helper Functions ───────────────────────────────────────────────────────

/**
 * Get exam category by ID
 */
export const getExamCategory = (id: string): ExamCategory | undefined => {
    return EXAM_CATEGORIES.find(c => c.id === id);
};

/**
 * Get persona config by ID (with fallback)
 */
export const getPersona = (id: string): PersonaConfig => {
    return PERSONAS[id] || PERSONAS.university_professor;
};

/**
 * Get tone config by ID (with fallback)
 */
export const getTone = (id: string): ToneConfig => {
    return TONES[id] || TONES.supportive;
};

/**
 * Get grouped categories for dropdown/select UI
 */
export const getGroupedCategories = () => {
    const groups: Record<string, ExamCategory[]> = {};
    for (const cat of EXAM_CATEGORIES) {
        if (!groups[cat.group]) groups[cat.group] = [];
        groups[cat.group].push(cat);
    }
    return groups;
};
