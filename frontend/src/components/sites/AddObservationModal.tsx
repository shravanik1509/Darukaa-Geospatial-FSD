import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { ObservationPayload } from "../../types/analytics";
import { getErrorMessage } from "../../services/api";

interface AddObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ObservationPayload) => Promise<void>;
  siteName: string;
}

export const AddObservationModal: React.FC<AddObservationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  siteName,
}) => {
  const [recordedAt, setRecordedAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [carbonValue, setCarbonValue] = useState("");
  const [biodiversityValue, setBiodiversityValue] = useState("");
  const [vegetationValue, setVegetationValue] = useState("");
  const [canopyCover, setCanopyCover] = useState("");
  const [soilMoisture, setSoilMoisture] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carbonValue || !biodiversityValue || !vegetationValue) {
      setError("Please provide Carbon, Biodiversity, and Vegetation measurements.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit({
        recorded_at: new Date(recordedAt).toISOString(),
        carbon_value: parseFloat(carbonValue),
        biodiversity_value: parseFloat(biodiversityValue),
        vegetation_value: parseFloat(vegetationValue),
        canopy_cover_percentage: canopyCover ? parseFloat(canopyCover) : undefined,
        soil_moisture_percentage: soilMoisture ? parseFloat(soilMoisture) : undefined,
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Field Observation: ${siteName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Observation Timestamp *
          </label>
          <input
            type="datetime-local"
            required
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Carbon (tCO2e/ha) *
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              placeholder="e.g. 85.4"
              value={carbonValue}
              onChange={(e) => setCarbonValue(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Biodiversity Index *
            </label>
            <input
              type="number"
              step="any"
              min="0"
              max="5"
              required
              placeholder="0.0 - 5.0"
              value={biodiversityValue}
              onChange={(e) => setBiodiversityValue(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              NDVI Index *
            </label>
            <input
              type="number"
              step="any"
              min="-1"
              max="1"
              required
              placeholder="-1.0 to 1.0"
              value={vegetationValue}
              onChange={(e) => setVegetationValue(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Canopy Cover (%)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              max="100"
              placeholder="e.g. 75"
              value={canopyCover}
              onChange={(e) => setCanopyCover(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Soil Moisture (%)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              max="100"
              placeholder="e.g. 55"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Record Observation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
