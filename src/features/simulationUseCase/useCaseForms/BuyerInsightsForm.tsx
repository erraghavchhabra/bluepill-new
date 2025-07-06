import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import { ArrowLeft, Globe, Briefcase, Users } from 'lucide-react';
import { useAudience } from '../../../context/AudienceContext';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';

interface SegmentPersonaFilters {
  industryL1: string[];
  industryL2: string[];
  functions: string[];
  roles: string[];
}

interface BuyerInsightsFormProps {
  onSubmit: (simulationId: number) => void;
  selectedSegmentIds: number[];
  personaFilters: Record<number, SegmentPersonaFilters>;
  onBack: () => void;
  onEditStep?: () => void; // Add this prop
  initialFormData?: Record<string, any>; // Add this prop to receive saved form data
  onFormDataChange?: (data: Record<string, any>) => void; // Add this prop to save form data
}

interface Segment {
  id: number;
  name: string;
  description: string;
  len: number; // Number of personas
  created_at: string;
  updated_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

const BuyerInsightsForm: React.FC<BuyerInsightsFormProps> = ({ 
  onSubmit, 
  selectedSegmentIds, 
  personaFilters, 
  onBack,
  onEditStep,
  initialFormData = {}, // Default to empty object if not provided
  onFormDataChange = () => {} // Default to no-op if not provided
}) => {
  const { audienceData } = useAudience();
  const [segments, setSegments] = useState<Segment[]>([]);
  
  // Initialize form values from initialFormData if available
  const [simName, setSimName] = useState(initialFormData.simName || '');
  const [productName, setProductName] = useState(initialFormData.productName || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialFormData.websiteUrl || '');
  const [context, setContext] = useState(initialFormData.context || '');
  const [businessModel, setBusinessModel] = useState<'B2B' | 'B2C'>(initialFormData.businessModel || 'B2B');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // When any form field changes, update the parent component
  useEffect(() => {
    const formData = {
      simName,
      productName,
      websiteUrl,
      context,
      businessModel
    };
    
    onFormDataChange(formData);
  }, [simName, productName, websiteUrl, context, businessModel]); // Remove onFormDataChange from dependencies
  
  // Handle form field changes
  const handleFormChange = () => {
    if (onEditStep) {
      onEditStep();
    }
  };
  
  // Fetch segments
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
        // Filter segments to only include the selected ones
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
  
  const isFormValid = selectedSegmentIds.length > 0 && 
                      productName.trim() !== '';

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare the simulation data
      const simulationData = {
        audience_id: audienceData.audienceId,
        segment_ids: selectedSegmentIds,
        persona_filters: personaFilters, // Include persona filters
        name: simName,
        task: businessModel === 'B2B' ? 'buyer-insights-report-b2b' : 'buyer-insights-report-b2c',
        objective: 'in-depth-buyer-insights-report',
        context: context,
        additional_data: {
          product_name: productName,
          website_url: websiteUrl
        }
      };
      
      // Send the request to start a simulation
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
      
      // Call onSubmit with the simulation ID instead of navigating away
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
            <p className="text-sm text-blue-800">Buyer insights report with {segments.length} selected segments</p>
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
            handleFormChange();
          }}
          placeholder="Enter a name for your simulation"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What product, service, or company do you want insights on?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                handleFormChange();
              }}
              placeholder="Name"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={websiteUrl}
              onChange={(e) => {
                setWebsiteUrl(e.target.value);
                handleFormChange();
              }}
              placeholder="Website link (optional)"
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Model
        </label>
        <RadioGroup
          value={businessModel}
          onValueChange={(val) => {
            setBusinessModel(val as 'B2B' | 'B2C');
            handleFormChange();
          }}
          className="flex flex-row gap-4"
        >
          <label
            htmlFor="b2b-radio"
            className={`
              group flex items-center cursor-pointer rounded-md border-2 px-3 py-2 transition-all flex-1 min-w-0
              ${businessModel === 'B2B' ? 'border-blue-600 bg-blue-50 shadow' : 'border-gray-200 bg-white'}
              hover:border-blue-400 hover:shadow-sm relative
            `}
          >
            <RadioGroupItem value="B2B" id="b2b-radio" className="sr-only" />
            <div className="flex items-center min-w-[90px]">
              <span className={`rounded-full p-1.5 mr-2 ${businessModel === 'B2B' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                <Briefcase className="h-5 w-5" />
              </span>
              <span className="font-semibold text-blue-900 text-sm">B2B</span>
            </div>
            <span className="ml-4 text-gray-600 text-xs text-left flex-1">
              Business to Business: Sell to other companies
            </span>
            {businessModel === 'B2B' && (
              <span className="absolute top-2 right-2 text-blue-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
            )}
          </label>
          <label
            htmlFor="b2c-radio"
            className={`
              group flex items-center cursor-pointer rounded-md border-2 px-3 py-2 transition-all flex-1 min-w-0
              ${businessModel === 'B2C' ? 'border-blue-600 bg-blue-50 shadow' : 'border-gray-200 bg-white'}
              hover:border-blue-400 hover:shadow-sm relative
            `}
          >
            <RadioGroupItem value="B2C" id="b2c-radio" className="sr-only" />
            <div className="flex items-center min-w-[90px]">
              <span className={`rounded-full p-1.5 mr-2 ${businessModel === 'B2C' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                <Users className="h-5 w-5" />
              </span>
              <span className="font-semibold text-blue-900 text-sm">B2C</span>
            </div>
            <span className="ml-4 text-gray-600 text-xs text-left flex-1">
              Business to Consumer: Sell directly to individuals
            </span>
            {businessModel === 'B2C' && (
              <span className="absolute top-2 right-2 text-blue-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
            )}
          </label>
        </RadioGroup>
      </div>
      
      <div className="mb-6">
        <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
          Context (Optional)
        </label>
        <textarea
          id="context"
          rows={4}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={context}
          onChange={(e) => {
            setContext(e.target.value);
            handleFormChange();
          }}
          placeholder="Add any additional details or specific areas you want insights on..."
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          withArrow
        >
          {isSubmitting ? 'Generating Report...' : 'Generate Buyer Insights Report'}
        </Button>
      </div>
    </div>
  );
};

export default BuyerInsightsForm;
