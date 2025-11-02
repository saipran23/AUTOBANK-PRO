import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="mb-8">
      {/* Mobile Progress Bar */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full banking-transition"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="mt-2">
          <h3 className="font-semibold text-foreground">{steps?.[currentStep - 1]?.title}</h3>
          <p className="text-sm text-muted-foreground">{steps?.[currentStep - 1]?.description}</p>
        </div>
      </div>
      {/* Desktop Step Indicator */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps?.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 banking-transition
                    ${isCompleted 
                      ? 'bg-success border-success text-white' 
                      : isActive 
                        ? 'bg-primary border-primary text-white' :'bg-background border-border text-muted-foreground'
                    }
                  `}>
                    {isCompleted ? (
                      <Icon name="Check" size={16} />
                    ) : (
                      <span className="text-sm font-semibold">{stepNumber}</span>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="mt-2 text-center max-w-32">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                    }`}>
                      {step?.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 hidden lg:block">
                      {step?.description}
                    </p>
                  </div>
                </div>
                {/* Connector Line */}
                {index < steps?.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className={`h-0.5 banking-transition ${
                      stepNumber < currentStep ? 'bg-success' : 'bg-border'
                    }`}></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;