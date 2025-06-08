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

    // Create an AbortController to handle cancellation
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 2000);

    try {
      const targetRgb = hexToRgb(targetColor);

      // Helper function to yield control back to the event loop
      const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve, 0));

      // Create the prediction promise with abort signal
      const predictionPromise = (async () => {
        // Check if aborted before starting
        if (abortController.signal.aborted) {
          throw new Error("Prediction timeout");
        }

        // First attempt: Try to achieve >65% accuracy
        console.log("Attempting to find mix with >65% accuracy...");

        // Yield control before starting computation
        await yieldToEventLoop();
        if (abortController.signal.aborted) {
          throw new Error("Prediction timeout");
        }

        let [ratios, accuracy, combination] = findOptimalRatiosFavourites(
          targetRgb,
          favouriteColors,
          65,
          300 // Reduced iterations for faster execution
        );

        // Yield control after first computation
        await yieldToEventLoop();
        if (abortController.signal.aborted) {
          throw new Error("Prediction timeout");
        }

        // If we didn't get 65% accuracy, try for >50% with more iterations
        if (accuracy < 65) {
          console.log(
            `First attempt achieved ${accuracy.toFixed(1)}%. Trying for >50% accuracy...`
          );

          const [ratios2, accuracy2, combination2] = findOptimalRatiosFavourites(
            targetRgb,
            favouriteColors,
            50,
            400 // Reduced iterations for faster execution
          );

          if (accuracy2 > accuracy) {
            ratios = ratios2;
            accuracy = accuracy2;
            combination = combination2;
          }
        }

        return { ratios, accuracy, combination };
      })();

      // Wait for prediction to complete
      const result = await predictionPromise;

      // Clear the timeout since we completed successfully
      clearTimeout(timeoutId);

      // Check if we achieved minimum requirements
      if (result.accuracy >= 50) {
        console.log(`Prediction successful with ${result.accuracy.toFixed(1)}% accuracy`);
        setSelectedColors(result.combination);
        onColorsChange?.(result.combination);
        setPredictionError?.(null);
      } else {
        // Error case: couldn't achieve 50% accuracy
        const errorMessage = `Unable to create an accurate mix with favourite colors. Best achievable accuracy: ${result.accuracy.toFixed(1)}%. Try selecting colors manually or adding more colors to your favourites.`;
        console.warn(errorMessage);
        setPredictionError?.(errorMessage);
      }

      setHasPredicted?.(true);
    } catch (error) {
      // Clear the timeout in case of error
      clearTimeout(timeoutId);

      console.error("Error predicting best mix:", error);

      if (error instanceof Error && (error.message === "Prediction timeout" || abortController.signal.aborted)) {
        setPredictionError?.("Prediction is taking longer than expected. The color might be difficult to mix with the available favorite colors. Try selecting colors manually.");
      } else {
        setPredictionError?.("An error occurred while predicting the best mix. Please try again.");
      }
    } finally {
      setIsPredicting?.(false);
    }
  };

  return { predictBestMix };
};