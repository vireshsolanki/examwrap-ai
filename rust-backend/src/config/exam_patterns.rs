use crate::models::{ExamType, StudyLevel};

#[derive(Debug, Clone)]
pub struct ExamPattern {
    pub name: String,
    pub marking_scheme: MarkingScheme,
    pub difficulty_distribution: DifficultyDistribution,
    pub special_instructions: String,
}

#[derive(Debug, Clone)]
pub struct MarkingScheme {
    pub correct: f32,
    pub incorrect: f32,
}

#[derive(Debug, Clone)]
pub struct DifficultyDistribution {
    pub easy_percent: u32,
    pub medium_percent: u32,
    pub hard_percent: u32,
}

impl ExamPattern {
    pub fn get_pattern(exam_type: &ExamType) -> Self {
        match exam_type {
            ExamType::JeeMains => Self {
                name: "JEE Mains".to_string(),
                marking_scheme: MarkingScheme {
                    correct: 4.0,
                    incorrect: -1.0,
                },
                difficulty_distribution: DifficultyDistribution {
                    easy_percent: 30,
                    medium_percent: 50,
                    hard_percent: 20,
                },
                special_instructions: "Focus on numerical problems (NUMERICAL type) and application-based MCQs. Include formula derivations and conceptual questions. Emphasize problem-solving speed and accuracy. For numerical questions, answer should be an integer between 0-9999.".to_string(),
            },
            
            ExamType::JeeAdvanced => Self {
                name: "JEE Advanced".to_string(),
                marking_scheme: MarkingScheme {
                    correct: 4.0,
                    incorrect: -2.0,
                },
                difficulty_distribution: DifficultyDistribution {
                    easy_percent: 20,
                    medium_percent: 40,
                    hard_percent: 40,
                },
                special_instructions: "Include multi-concept questions, comprehension-based problems, and questions with multiple correct answers (MULTI_CORRECT type). Focus on deep conceptual understanding and analytical thinking. Use NUMERICAL type for integer answer questions.".to_string(),
            },
            
            ExamType::Neet => Self {
                name: "NEET".to_string(),
                marking_scheme: MarkingScheme {
                    correct: 4.0,
                    incorrect: -1.0,
                },
                difficulty_distribution: DifficultyDistribution {
                    easy_percent: 40,
                    medium_percent: 40,
                    hard_percent: 20,
                },
                special_instructions: "Include assertion-reasoning questions (ASSERTION_REASONING type). Format: Statement I (Assertion) and Statement II (Reason). Options: (a) Both correct, reason is correct explanation (b) Both correct, reason is NOT correct explanation (c) Assertion correct, Reason incorrect (d) Assertion incorrect, Reason correct. Focus on NCERT-based factual recall, diagrams, and biological processes.".to_string(),
            },
            
            ExamType::Cat => Self {
                name: "CAT".to_string(),
                marking_scheme: MarkingScheme {
                    correct: 3.0,
                    incorrect: -1.0,
                },
                difficulty_distribution: DifficultyDistribution {
                    easy_percent: 20,
                    medium_percent: 50,
                    hard_percent: 30,
                },
                special_instructions: "Focus on logical reasoning, data interpretation, and verbal ability. Include passage-based questions and quantitative aptitude problems. Emphasize speed and accuracy.".to_string(),
            },
            
            ExamType::Gate => Self {
                name: "GATE".to_string(),
                marking_scheme: MarkingScheme {
                    correct: 2.0,
                    incorrect: -0.66,
                },
                difficulty_distribution: DifficultyDistribution {
                    easy_percent: 30,
                    medium_percent: 50,
                    hard_percent: 20,
                },
                special_instructions: "Include numerical answer type questions and MCQs. Focus on core engineering concepts, problem-solving, and analytical ability.".to_string(),
            },
            
            ExamType::Upsc => Self {
                name: "UPSC".to_string(),
                marking_scheme: MarkingScheme {
                    correct: 2.0,
                    incorrect: -0.66,
                },
                difficulty_distribution: DifficultyDistribution {
                    easy_percent: 30,
                    medium_percent: 50,
                    hard_percent: 20,
                },
                special_instructions: "Focus on current affairs, analytical reasoning, and comprehensive understanding. Include questions on governance, economy, and general studies.".to_string(),
            },
            
            ExamType::University => Self {
                name: "University Exam".to_string(),
                marking_scheme: MarkingScheme {
                    correct: 1.0,
                    incorrect: 0.0,
                },
                difficulty_distribution: DifficultyDistribution {
                    easy_percent: 40,
                    medium_percent: 40,
                    hard_percent: 20,
                },
                special_instructions: "Balanced mix of theoretical and practical questions. Include both recall and application-based problems.".to_string(),
            },
            
            ExamType::SchoolCbse | ExamType::SchoolIcse => Self {
                name: "School Board Exam".to_string(),
                marking_scheme: MarkingScheme {
                    correct: 1.0,
                    incorrect: 0.0,
                },
                difficulty_distribution: DifficultyDistribution {
                    easy_percent: 50,
                    medium_percent: 35,
                    hard_percent: 15,
                },
                special_instructions: "Focus on NCERT/textbook-based questions. Include a mix of short answer and long answer questions. Emphasize clear explanations and step-by-step solutions.".to_string(),
            },
            
            ExamType::Other => Self {
                name: "General Exam".to_string(),
                marking_scheme: MarkingScheme {
                    correct: 1.0,
                    incorrect: 0.0,
                },
                difficulty_distribution: DifficultyDistribution {
                    easy_percent: 40,
                    medium_percent: 40,
                    hard_percent: 20,
                },
                special_instructions: "Balanced mix of recall and application questions.".to_string(),
            },
        }
    }
    
    pub fn get_study_level_instruction(study_level: &StudyLevel) -> &'static str {
        match study_level {
            StudyLevel::Beginner => "Focus on fundamental concepts and basic application. Avoid overly complex problems. Include more explanation in answers.",
            StudyLevel::Intermediate => "Mix of conceptual and application-based questions. Moderate difficulty with some challenging problems.",
            StudyLevel::Advanced => "Include tricky questions, edge cases, and advanced applications. Challenge the student with complex multi-step problems.",
        }
    }
}
