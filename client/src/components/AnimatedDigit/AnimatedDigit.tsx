import { useEffect, useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import '../../styles/AnimatedDigit.css';

interface AnimatedDigitProps {
  value: number;
}

function AnimatedDigit({ value }: AnimatedDigitProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== displayValue) {
      // Clear any inline styles from previous animation
      if (scrollRef.current) {
        scrollRef.current.style.transition = '';
        scrollRef.current.style.transform = '';
      }

      setIsAnimating(true);
      const timer = setTimeout(() => {
        // Update state synchronously so DOM updates before transform reset
        flushSync(() => {
          setDisplayValue(value);
          setIsAnimating(false);
        });

        // After state is committed to DOM, reset without transition
        if (scrollRef.current) {
          scrollRef.current.style.transition = 'none';
          scrollRef.current.style.transform = 'translateY(0)';
          // Force reflow
          scrollRef.current.offsetHeight;
          // Clear inline styles so CSS classes work next time
          requestAnimationFrame(() => {
            if (scrollRef.current) {
              scrollRef.current.style.transition = '';
              scrollRef.current.style.transform = '';
            }
          });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <div className="animated-digit-container">
      <div className="animated-digit-window">
        <div
          ref={scrollRef}
          className={`animated-digit-scroll ${isAnimating ? 'animated-digit-scroll--animating' : ''}`}
        >
          <span className="animated-digit-value">{displayValue}</span>
          <span className="animated-digit-value">{value}</span>
        </div>
      </div>
      <div className="animated-digit-fade-top"></div>
      <div className="animated-digit-fade-bottom"></div>
    </div>
  );
}

export default AnimatedDigit;
