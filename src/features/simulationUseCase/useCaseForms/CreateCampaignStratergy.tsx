import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/Button';
import { ArrowLeft } from 'lucide-react';
import { useAudience } from '../../../context/AudienceContext';

interface SegmentPersonaFilters {
  industryL1: string[];
  industryL2: string[];
  functions: string[];
  roles: string[];
}

interface InsightsFormProps {
  onSubmit: (simulationId: number) => void;
  selectedSegmentIds: number[];
  personaFilters: Record<number, SegmentPersonaFilters>;
  onBack: () => void;
  onEditStep?: () => void; // Add this prop for edit tracking
  initialFormData?: Record<string, any>; // Add this prop for form state persistence
  onFormDataChange?: (data: Record<string, any>) => void; // Add this prop for notifying parent of changes
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

const CreateCampaignStratergy: React.FC<InsightsFormProps> = ({ 
  onSubmit, 
  selectedSegmentIds, 
  personaFilters, 
  onBack,
  onEditStep,
  initialFormData = {},
  onFormDataChange = () => {}
}) => {
  const navigate = useNavigate();
  const { audienceData } = useAudience();
  const [segments, setSegments] = useState<Segment[]>([]);
  
  // Initialize form state from initialFormData
  const [simName, setSimName] = useState(initialFormData.simName || '');
  const [goal, setGoal] = useState(initialFormData.goal || '');
  const [product, setProduct] = useState(initialFormData.product || '');
  const [productWebsite, setProductWebsite] = useState(initialFormData.productWebsite || '');
  const [budget, setBudget] = useState(initialFormData.budget || '');
  const [team, setTeam] = useState(initialFormData.team || '');
  const [brandPosition, setBrandPosition] = useState(initialFormData.brandPosition || '');
  const [timeline, setTimeline] = useState(initialFormData.timeline || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update parent component with form data changes
  useEffect(() => {
    const formData = {
      simName,
      goal,
      product,
      productWebsite,
      budget,
      team,
      brandPosition,
      timeline,
    };
    
    onFormDataChange(formData);
  }, [simName, goal, product, productWebsite, budget, team, brandPosition, timeline]); // Remove onFormDataChange from dependencies
  
  // Handle field changes and notify parent about edits
  const handleFieldChange = (
    setter: React.Dispatch<React.SetStateAction<string>>, 
    value: string
  ) => {
    setter(value);
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
  
  const isFormValid =
    simName.trim() !== '' &&
    goal.trim() !== '' &&
    product.trim() !== '' &&
    productWebsite.trim() !== '' &&
    selectedSegmentIds.length > 0;

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare the simulation data
      const simulationData = {
        audience_id: audienceData.audienceId,
        segment_ids: selectedSegmentIds,
        name: simName,
        persona_filters: personaFilters, // Include persona filters
        task: 'create_campaign_strategy',
        goal: goal,
        product: product,
        product_website: productWebsite,
        budget: budget,
        team: team,
        brand_position: brandPosition,
        timeline: timeline,
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
            <p className="text-sm text-blue-800">
              Generating campaign strategy with {segments.length} selected segments
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="simName" className="block text-sm font-medium text-gray-700 mb-2">
            Simulation Name*
          </label>
          <input
            id="simName"
            type="text"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={simName}
            onChange={(e) => handleFieldChange(setSimName, e.target.value)}
            placeholder="Enter a name for your simulation"
          />
        </div>
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
            Goal*
          </label>
          <input
            id="goal"
            type="text"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={goal}
            onChange={(e) => handleFieldChange(setGoal, e.target.value)}
            placeholder="e.g., +5% market share in 6 months"
          />
        </div>
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
            Product*
          </label>
          <input
            id="product"
            type="text"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={product}
            onChange={(e) => handleFieldChange(setProduct, e.target.value)}
            placeholder="Enter product name"
          />
        </div>
        <div>
          <label
            htmlFor="productWebsite"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Product website*
          </label>
          <input
            id="productWebsite"
            type="url"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={productWebsite}
            onChange={(e) => handleFieldChange(setProductWebsite, e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
            Budget
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              $
            </span>
            <input
              id="budget"
              type="text"
              className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={budget}
              onChange={(e) => handleFieldChange(setBudget, e.target.value)}
              placeholder="Total budget"
            />
          </div>
        </div>

        <div>
          <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-2">
            Team
          </label>
          <select
            id="team"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={team}
            onChange={(e) => handleFieldChange(setTeam, e.target.value)}
          >
            <option value="">Select team structure</option>
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
            <option value="Agency">Agency</option>
            <option value="In-house">In-house</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label htmlFor="brandPosition" className="block text-sm font-medium text-gray-700 mb-2">
            Brand position
          </label>
          <select
            id="brandPosition"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={brandPosition}
            onChange={(e) => handleFieldChange(setBrandPosition, e.target.value)}
          >
            <option value="">Select brand position</option>
            <option value="Leader">Leader</option>
            <option value="Challenger">Challenger</option>
            <option value="Disruptor">Disruptor</option>
            <option value="Newcomer">Newcomer</option>
          </select>
        </div>

        <div>
          <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
            Timeline
          </label>
          <input
            id="timeline"
            type="text"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={timeline}
            onChange={(e) => handleFieldChange(setTimeline, e.target.value)}
            placeholder="Concepts by [date], in-market by [date]"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Starting...' : 'Start Simulation'}
        </Button>
      </div>
    </div>
  );
};

export default CreateCampaignStratergy;