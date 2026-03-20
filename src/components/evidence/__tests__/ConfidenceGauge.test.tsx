import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConfidenceGauge } from '../ConfidenceGauge';

describe('ConfidenceGauge', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ConfidenceGauge score={94} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('displays the correct percentage text', () => {
    render(<ConfidenceGauge score={94} />);
    expect(screen.getByText('94%')).toBeInTheDocument();
  });

  it('shows "High Confidence" for scores above 80', () => {
    render(<ConfidenceGauge score={85} />);
    expect(screen.getByText('High Confidence')).toBeInTheDocument();
  });

  it('shows "Medium Confidence" for scores between 51 and 80', () => {
    render(<ConfidenceGauge score={65} />);
    expect(screen.getByText('Medium Confidence')).toBeInTheDocument();
  });

  it('shows "Low Confidence" for scores 50 and below', () => {
    render(<ConfidenceGauge score={30} />);
    expect(screen.getByText('Low Confidence')).toBeInTheDocument();
  });

  it('renders a circle element for the progress ring', () => {
    const { container } = render(<ConfidenceGauge score={94} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThanOrEqual(2); // background + progress
  });

  it('applies correct stroke-dashoffset proportional to score', () => {
    const { container } = render(<ConfidenceGauge score={50} />);
    const progressCircle = container.querySelectorAll('circle')[1];
    // circumference = 2 * PI * radius; with r=52, C ≈ 326.73
    // offset = C * (1 - score/100) = 326.73 * 0.5 ≈ 163.36
    const offset = parseFloat(progressCircle?.getAttribute('stroke-dashoffset') || '0');
    expect(offset).toBeCloseTo(326.73 * 0.5, 0);
  });
});
