type InitOptions = {
    rules?: string[];
    excludeRules?: string[];
    mockPanelSdkUrl: string;
    disabled?: boolean;
};
declare const mockInit: (options?: InitOptions) => Promise<boolean>;

export { mockInit };
