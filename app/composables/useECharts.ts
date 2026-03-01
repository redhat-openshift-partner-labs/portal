import * as echarts from 'echarts/core'

/**
 * ECharts utility composable for common chart operations
 */
export function useECharts() {
  /**
   * Creates a linear gradient for area chart fills
   * @param colorStops - Array of color stops with offset and color
   */
  function createLinearGradient(colorStops: Array<{ offset: number, color: string }>) {
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, colorStops)
  }

  /**
   * Creates area gradient with consistent styling
   * @param color - Base color (hex or rgb)
   * @param opacityFrom - Starting opacity (0-1)
   * @param opacityTo - Ending opacity (0-1)
   */
  function createAreaGradient(color: string, opacityFrom = 0.4, opacityTo = 0.05) {
    // Convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (result && result[1] && result[2] && result[3]) {
        const r = Number.parseInt(result[1], 16)
        const g = Number.parseInt(result[2], 16)
        const b = Number.parseInt(result[3], 16)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
      return hex
    }

    return createLinearGradient([
      { offset: 0, color: hexToRgba(color, opacityFrom) },
      { offset: 1, color: hexToRgba(color, opacityTo) },
    ])
  }

  return {
    createLinearGradient,
    createAreaGradient,
  }
}
