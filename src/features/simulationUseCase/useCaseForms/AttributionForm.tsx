import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { ArrowLeft } from 'lucide-react';
import { useAudience } from '../../../context/AudienceContext';

interface SegmentPersonaFilters {
  industryL1: string[];
  industryL2: string[];
  functions: string[];
  roles: string[];
}

interface AttributionFormProps {
  onSubmit: (simulationId: number) => void;
  selectedSegmentIds: number[];
  personaFilters: Record<number, SegmentPersonaFilters>;
  onBack: () => void;
  onEditStep?: () => void;
  initialFormData?: Record<string, any>;
  onFormDataChange?: (data: Record<string, any>) => void;
}

interface Segment {
  id: number;
  name: string;
  description: string;
  len: number;
  created_at: string;
  updated_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

const AttributionForm: React.FC<AttributionFormProps> = ({ 
  onSubmit, 
  selectedSegmentIds, 
  personaFilters, 
  onBack, 
  onEditStep,
  initialFormData = {},
  onFormDataChange = () => {}
}) => {
  const { audienceData } = useAudience();
  const [segments, setSegments] = useState<Segment[]>([]);
  
  // Initialize form state
  const [simName, setSimName] = useState(initialFormData.simName || '');
  const [objective, setObjective] = useState(initialFormData.objective || '');
  const [marketingCopies, setMarketingCopies] = useState<string[]>(
    initialFormData.marketingCopies || ['']
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update parent component with form data changes
  useEffect(() => {
    const formData = {
      simName,
      objective,
      marketingCopies
    };
    onFormDataChange(formData);
  }, [simName, objective, marketingCopies]);
  
  // Handler to notify parent about edits
  const handleEdit = () => {
    if (onEditStep) {
      onEditStep();
    }
  };
  
  useEffect(() => {
    const fetchSegments = async () => {
      if (!audienceData.audienceId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/audience/${audienceData.audienceId}/segments`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch segments');
        }
        
        const data = await response.json();
        const filteredSegments = data.filter((segment: Segment) => 
          selectedSegmentIds.includes(segment.id)
        );
        setSegments(filteredSegments);
        setError(null);
      } catch (err) {
        console.error('Error fetching segments:', err);
        setError('Failed to load segments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSegments();
  }, [audienceData.audienceId, selectedSegmentIds]);

  // Add handlers for marketing copies
  const handleMarketingCopyChange = (index: number, value: string) => {
    const newCopies = [...marketingCopies];
    newCopies[index] = value;
    setMarketingCopies(newCopies);
    handleEdit();
  };

  const addMarketingCopy = () => {
    setMarketingCopies([...marketingCopies, '']);
    handleEdit();
  };

  const removeMarketingCopy = (index: number) => {
    if (marketingCopies.length > 1) {
      const newCopies = marketingCopies.filter((_, i) => i !== index);
      setMarketingCopies(newCopies);
      handleEdit();
    }
  };

  const isFormValid = selectedSegmentIds.length > 0 && 
                     objective.trim() !== '' &&
                     marketingCopies.every(copy => copy.trim() !== '') &&
                     marketingCopies.length >= 2; // Ensure at least 2 copies for A/B testing

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const simulationData = {
        audience_id: audienceData.audienceId,
        segment_ids: selectedSegmentIds,
        persona_filters: personaFilters,
        name: simName,
        task: 'ab-test-messaging',
        objective: objective,
        marketing_copies: marketingCopies
      };
      
      const response = await fetch(`${API_URL}/simulations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(simulationData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to start simulation');
      }
      const data = await response.json();
      onSubmit(data.simulation_id);
    } catch (err) {
      console.error('Error starting simulation:', err);
      setError('Failed to start simulation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            icon={<ArrowLeft className="w-4 h-4 mr-1" />}
          >
            Back to use case selection
          </Button>
          <span className="text-sm text-gray-500">{selectedSegmentIds.length} segments selected</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 mb-3">
            {error}
          </div>
        ) : (
          <div className="p-3 bg-blue-50 rounded-md mb-4">
            <p className="text-sm text-blue-800">A/B Testing with {segments.length} selected segments</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="simName" className="block text-sm font-medium text-gray-700 mb-2">
          Simulation Name
        </label>
        <input
          id="simName"
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={simName}
          onChange={(e) => {
            setSimName(e.target.value);
            handleEdit();
          }}
          placeholder="Enter a name for your A/B test"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-2">
          Objective
        </label>
        <textarea
          id="objective"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
          value={objective}
          onChange={(e) => {
            setObjective(e.target.value);
            handleEdit();
          }}
          placeholder="What is your objective? (e.g., which headline will maximize click-through rate?)"
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Marketing Copies to Test
          </label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addMarketingCopy}
          >
            Add Copy
          </Button>
        </div>
        
        {marketingCopies.map((copy, index) => (
          <div key={index} className="mb-3 relative">
            <textarea
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
              value={copy}
              onChange={(e) => handleMarketingCopyChange(index, e.target.value)}
              placeholder={`Marketing copy ${index + 1} (e.g., "Move Freely. Feel Deeply. Live Beyond.")`}
            />
            {marketingCopies.length > 1 && ( // Changed from > 1 to > 2 to ensure at least 2 copies
              <button
                type="button"
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => removeMarketingCopy(index)}
                aria-label="Remove copy"
                title="Remove copy"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {marketingCopies.length < 2 && (
          <p className="text-sm text-amber-600 mt-2">
            Please add at least 2 marketing copies for A/B testing
          </p>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          withArrow
        >
          {isSubmitting ? 'Running A/B Test...' : 'Run A/B Test'}
        </Button>
      </div>
    </div>
  );
};

export default AttributionForm;
