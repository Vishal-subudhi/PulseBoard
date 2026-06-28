import { create } from 'zustand'

const useDashboardStore = create((set) => ({
  selectedSourceId: null,
  chartType: 'bar',
  setSelectedSource: (id)  => set({ selectedSourceId: id }),
  setChartType:     (type) => set({ chartType: type }),
}))

export default useDashboardStore