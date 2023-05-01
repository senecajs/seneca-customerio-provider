type CustomerioProviderOptions = {
    entity: Record<string, any>;
    sdkopts: Record<string, any>;
    region: string;
    debug: boolean;
};
declare function CustomerioProvider(this: any, options: CustomerioProviderOptions): {
    exports: {
        sdk: () => any;
    };
};
export default CustomerioProvider;
