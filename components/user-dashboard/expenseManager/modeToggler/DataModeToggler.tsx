// dashboard\components\user-dashboard\expenseManager\modeToggler\DataModeToggler.tsx

type Props = {
    store: any;
}

const DataModeToggler = ({store}: Props) => {
    return (
        <div className="flex items-center gap-2 para-tiny text-text-secondary-muter">
            <span>Mode: {store.dataMode === "demo" ? "Demo" : "Blank"}</span>
            <button onClick={store.dataMode === "demo" ? store.resetToBlank : store.loadDemoData}
                className="rounded-brand-8 border border-border-clr px-2.5 py-2 para-tiny font-semibold hover:bg-page-bg">
                {store.dataMode === "demo" ? "Start Fresh" : "Load Demo Data"}
            </button>
        </div>
    )
}

export default DataModeToggler