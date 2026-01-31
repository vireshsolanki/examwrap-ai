use printpdf::*;
use std::io::BufWriter;
use crate::models::{Question, QuestionType};

pub struct PdfGenerator;

impl PdfGenerator {
    /// Generate a question paper PDF
    pub fn generate_question_paper(
        questions: &[Question],
        title: &str,
        time_limit: Option<u32>,
        max_marks: Option<u32>,
    ) -> Result<Vec<u8>, String> {
        // Create a new PDF document
        let (doc, page1, layer1) = PdfDocument::new("Question Paper", Mm(210.0), Mm(297.0), "Layer 1");
        let current_layer = doc.get_page(page1).get_layer(layer1);
        
        // Load fonts
        let font = doc.add_builtin_font(BuiltinFont::Helvetica).map_err(|e| format!("Font error: {}", e))?;
        let font_bold = doc.add_builtin_font(BuiltinFont::HelveticaBold).map_err(|e| format!("Font error: {}", e))?;
        
        let mut y_position = Mm(270.0); // Start from top
        
        // Header
        current_layer.use_text(title, 16.0, Mm(20.0), y_position, &font_bold);
        y_position -= Mm(10.0);
        
        // Time and marks info
        if let (Some(time), Some(marks)) = (time_limit, max_marks) {
            let info = format!("Time: {} Hours                    Max Marks: {}", time / 60, marks);
            current_layer.use_text(&info, 12.0, Mm(20.0), y_position, &font);
            y_position -= Mm(15.0);
        }
        
        y_position -= Mm(5.0); // Space for line
        
        // Questions
        for (i, question) in questions.iter().enumerate() {
            // Check if we need a new page
            if y_position < Mm(50.0) {
                let (_page, _layer) = doc.add_page(Mm(210.0), Mm(297.0), "Layer 1");
                y_position = Mm(270.0);
            }
            
            // Question number and text
            let question_header = format!("{}. {}", i + 1, question.text);
            current_layer.use_text(&question_header, 11.0, Mm(20.0), y_position, &font);
            y_position -= Mm(8.0);
            
            // For MCQs, add options
            if let Some(options) = &question.options {
                for (j, option) in options.iter().enumerate() {
                    let option_text = format!("   ({}) {}", char::from(b'a' + j as u8), option);
                    current_layer.use_text(&option_text, 10.0, Mm(25.0), y_position, &font);
                    y_position -= Mm(6.0);
                }
            } else {
                // For short/long answer, add space
                let lines_needed = match question.question_type {
                    QuestionType::ShortAnswer => 3,
                    QuestionType::LongAnswer => 8,
                    _ => 3,
                };
                
                y_position -= Mm(lines_needed as f32 * 8.0);
            }
            
            y_position -= Mm(10.0); // Space between questions
        }
        
        // Save to bytes
        let mut buf = Vec::new();
        doc.save(&mut BufWriter::new(&mut buf)).map_err(|e| format!("PDF save error: {}", e))?;
        
        Ok(buf)
    }
    
    /// Generate answer key PDF
    pub fn generate_answer_key(
        questions: &[Question],
        title: &str,
    ) -> Result<Vec<u8>, String> {
        let (doc, page1, layer1) = PdfDocument::new("Answer Key", Mm(210.0), Mm(297.0), "Layer 1");
        let current_layer = doc.get_page(page1).get_layer(layer1);
        
        let font = doc.add_builtin_font(BuiltinFont::Helvetica).map_err(|e| format!("Font error: {}", e))?;
        let font_bold = doc.add_builtin_font(BuiltinFont::HelveticaBold).map_err(|e| format!("Font error: {}", e))?;
        
        let mut y_position = Mm(270.0);
        
        // Header
        let header = format!("ANSWER KEY - {}", title);
        current_layer.use_text(&header, 16.0, Mm(20.0), y_position, &font_bold);
        y_position -= Mm(20.0);
        
        // Answers
        for (i, question) in questions.iter().enumerate() {
            if y_position < Mm(50.0) {
                let (_page, _layer) = doc.add_page(Mm(210.0), Mm(297.0), "Layer 1");
                y_position = Mm(270.0);
            }
            
            // Question number
            let q_num = format!("{}.", i + 1);
            current_layer.use_text(&q_num, 12.0, Mm(20.0), y_position, &font_bold);
            
            // Answer
            if let Some(options) = &question.options {
                if let Some(correct_idx) = question.correct_answer_index {
                    let correct_option = char::from(b'a' + correct_idx as u8);
                    let answer = format!("({}) {}", correct_option, &options[correct_idx as usize]);
                    current_layer.use_text(&answer, 11.0, Mm(30.0), y_position, &font);
                }
            } else if let Some(model_answer) = &question.model_answer {
                current_layer.use_text(model_answer, 11.0, Mm(30.0), y_position, &font);
            }
            
            y_position -= Mm(8.0);
            
            // Explanation
            if !question.explanation.is_empty() {
                let explanation = format!("Explanation: {}", question.explanation);
                current_layer.use_text(&explanation, 9.0, Mm(30.0), y_position, &font);
                y_position -= Mm(6.0);
            }
            
            y_position -= Mm(8.0); // Space between answers
        }
        
        let mut buf = Vec::new();
        doc.save(&mut BufWriter::new(&mut buf)).map_err(|e| format!("PDF save error: {}", e))?;
        
        Ok(buf)
    }
}
