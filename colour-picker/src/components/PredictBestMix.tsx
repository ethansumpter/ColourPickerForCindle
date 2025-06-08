import { Color } from "@/types/color";
import { hexToRgb, findOptimalRatiosFavourites } from "@/lib/utils/colorUtils";

interface UsePredictBestMixProps {
  targetColor: string | null;
  isClient: boolean;
  favouriteColors: Color[];
  setSelectedColors: (colors: Color[]) => void;
  onColorsChange?: (colors: Color[]) => void;
  setHasPredicted?: (value: boolean) => void;
  setIsPredicting?: (value: boolean) => void;
  setPredictionError?: (error: string | null) => void;
}

export const usePredictBestMix = ({
  targetColor,
  isClient,
  favouriteColors,
  setSelectedColors,
  onColorsChange,
  setHasPredicted,
  setIsPredicting,
  setPredictionError,
}: UsePredictBestMixProps) => {
  const predictBestMix = async () => {
    if (!targetColor || !isClient) return;

    setIsPredicting?.(true);
    setPredictionError?.(null);

    try {
      const targetRgb = hexToRgb(targetColor);

      // First attempt: Try to achieve >65% accuracy
      console.log("Attempting to find mix with >65% accuracy...");
      let [ratios, accuracy, combination] = findOptimalRatiosFavourites(
        targetRgb,
        favouriteColors,
        65,
        600
      );

      // If we didn't get 65% accuracy, try for >50% with more iterations
      if (accuracy < 65) {
        console.log(`First attempt achieved ${accuracy.toFixed(1)}%. Trying for >50% accuracy...`);
        const [ratios2, accuracy2, combination2] = findOptimalRatiosFavourites(
          targetRgb,
          favouriteColors,
          50,
          800
        );

        if (accuracy2 > accuracy) {
          ratios = ratios2;
          accuracy = accuracy2;
          combination = combination2;
        }
      }

      // Check if we achieved minimum requirements
      if (accuracy >= 50) {
        console.log(`Prediction successful with ${accuracy.toFixed(1)}% accuracy`);
        setSelectedColors(combination);
        onColorsChange?.(combination);
        setPredictionError?.(null);
      } else {
        // Error case: couldn't achieve 50% accuracy
        const errorMessage = `Unable to create an accurate mix with favourite colors. Best achievable accuracy: ${accuracy.toFixed(1)}%. Try selecting colors manually or adding more colors to your favourites.`;
        console.warn(errorMessage);
        setPredictionError?.(errorMessage);
      }

      setHasPredicted?.(true);
    } catch (error) {
      console.error("Error predicting best mix:", error);
      setPredictionError?.("An error occurred while predicting the best mix. Please try again.");
    } finally {
      setIsPredicting?.(false);
    }
  };

  return { predictBestMix };
};