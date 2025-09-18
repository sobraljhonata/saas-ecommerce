export declare const Topics: {
    Outbox: string;
    OrderCommands: {
        Confirm: string;
    };
    OrderEvents: {
        Placed: string;
        Confirmed: string;
        Failed: string;
    };
    InventoryCommands: {
        Reserve: string;
        Release: string;
    };
    InventoryEvents: {
        Reserved: string;
        Failed: string;
        Released: string;
    };
    PaymentCommands: {
        Authorize: string;
        Refund: string;
    };
    PaymentEvents: {
        Authorized: string;
        Failed: string;
        Refunded: string;
    };
    ShippingCommands: {
        Prepare: string;
    };
    ShippingEvents: {
        Prepared: string;
        Failed: string;
    };
};
