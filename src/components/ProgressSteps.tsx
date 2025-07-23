import React from "react";
import { Check } from "lucide-react";

interface StepProps {
  label: string;
  completed: boolean;
  current: boolean;
  onClick?: () => void;
  disabled?: boolean;
  description?: string;
  icons?: any;
}

interface ProgressStepsProps {
  steps: StepProps[];
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps }) => {
  // Find the index of the current step
  const currentStepIndex = steps.findIndex((step) => step.current);

  // Calculate progress width based on current step position
  // For a 5-step process with specific positions at 5%, 25%, 50%, 75%, 95%
  const stepPositions = [5, 25, 50, 75, 95]; // vw percentages
  const progressWidth =
    steps.length <= 1
      ? 0
      : `${currentStepIndex > 0 ? stepPositions[currentStepIndex] : 0}%`;

  return (
    <div className="w-[323px] mb-6 sticky left-0 top-[90px] ml-[30px]">
      <h3 className="text-[28px] font-semibold text-black mb-2">Simulate</h3>
      <p className="text-xs font-normal text-[#595E64]">
        Lorem ipsum dolor sit amet consectetur. Diam sed erat enim justo a eu
        eu. Nibh id tellus.
      </p>
      <div className="flex flex-col gap-3 mt-5">
        {steps.map((step, idx) => {
          // Check if step is clickable
          const isClickable = !!step.onClick && !step.disabled;
          // Position steps at specific points
          // const leftPosition = `${stepPositions[idx] || 0}%`;

          return (
            <div
              key={idx}
              className={`
                text-sm font-semibold flex items-center rounded-xl gap-[10px] p-3 pl-5 border-l-4
                     
                      ${
                        step.completed
                          ? "text-primary2 bg-[#E6FCFA] border-transparent cursor-pointer"
                          : step.current
                          ? "text-primary2 bg-[#E6FCFA] border-primary2"
                          : idx <= currentStepIndex
                          ? "text-black"
                          : "text-[#595E64] border-transparent bg-[#FAFAFA]"
                      }
                      
                    `}
              onClick={isClickable ? step.onClick : undefined}
              title={
                !isClickable && step.disabled
                  ? "Complete previous steps first"
                  : ""
              }
            >
              {step.icons}
              {step.label}

              {/* Description - only show for current step */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSteps;
