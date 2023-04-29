type CustomerioProviderOptions = {
    entity: Record<string, any>;
    sdkopts: Record<string, any>;
    debug: boolean;
};
declare function CustomerioProvider(this: any, options: CustomerioProviderOptions): {
    exports: {};
};
export default CustomerioProvider;
