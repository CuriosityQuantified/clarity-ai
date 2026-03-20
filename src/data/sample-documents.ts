import { Document } from '@/types/document';

export const sampleDocument: Document = {
  id: 'doc-1',
  title: 'AI Adoption in Healthcare: Trends, Challenges, and Future Outlook',
  subtitle: 'A comprehensive review of artificial intelligence applications in modern healthcare systems',
  authors: ['Dr. Sarah Chen', 'Prof. Michael Torres', 'Dr. Aisha Patel'],
  date: '2026-01-15',
  source: 'Journal of Medical AI Research',
  paragraphs: [
    {
      id: 'p1',
      text: 'Artificial intelligence has emerged as a transformative force in healthcare, fundamentally reshaping how medical professionals diagnose, treat, and manage patient care. From machine learning algorithms that can detect early signs of disease in medical imaging to natural language processing systems that streamline clinical documentation, AI technologies are being integrated across virtually every aspect of modern healthcare delivery.',
    },
    {
      id: 'p2',
      text: 'Recent studies have shown that AI diagnostic tools have achieved accuracy rates of up to 94% in detecting certain types of cancer from medical imaging, often matching or exceeding the performance of experienced radiologists. These tools are particularly effective in analyzing mammograms, CT scans, and pathology slides, where subtle patterns may be difficult for human observers to consistently identify.',
    },
    {
      id: 'p3',
      text: 'Despite these promising developments, the adoption of AI in healthcare faces significant challenges. Concerns about data privacy, algorithmic bias, and the need for regulatory frameworks continue to slow implementation. Healthcare providers must also address the cultural shift required to integrate AI tools into established clinical workflows without disrupting patient care.',
    },
    {
      id: 'p4',
      text: 'The economic impact of AI adoption in healthcare is substantial. According to recent analyses, AI-driven healthcare solutions could save the industry an estimated $150 billion annually by 2026. These savings come primarily from improvements in clinical efficiency, reduction in diagnostic errors, and optimization of treatment protocols.',
    },
    {
      id: 'p5',
      text: 'Looking ahead, the convergence of AI with other emerging technologies — including genomics, wearable health monitors, and telemedicine platforms — promises to create a more personalized, predictive, and preventive healthcare ecosystem. The key to realizing this vision lies in developing robust governance frameworks that ensure AI systems are transparent, equitable, and aligned with patient interests.',
    },
  ],
};

export const mockVerification = {
  selectedText: 'AI diagnostic tools have achieved accuracy rates of up to 94% in detecting certain types of cancer from medical imaging',
  directQuote: 'Our meta-analysis of 47 studies found that AI-based diagnostic systems achieved a pooled sensitivity of 94.2% (95% CI: 91.8-96.1%) for cancer detection in medical imaging, comparable to the 94.5% sensitivity reported for expert radiologists.',
  sourceUrl: 'https://www.nature.com/articles/s41591-024-02847-3',
  sourceDomain: 'nature.com',
  confidenceScore: 94,
  verified: true,
};
