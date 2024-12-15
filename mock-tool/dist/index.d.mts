type InitOptions = {
    auto?: boolean;
    rules?: string[];
    excludeRules?: string[];
    mockSdkUrl: string;
};
declare const mockInit: (options?: InitOptions) => Promise<boolean>;

export { mockInit };
