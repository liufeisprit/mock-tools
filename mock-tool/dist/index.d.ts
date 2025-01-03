type InitOptions = {
    auto?: boolean;
    rules?: string[];
    excludeRules?: string[];
    mockPanelSdkUrl: string;
};
declare const mockInit: (options?: InitOptions) => Promise<boolean>;

export { mockInit };
