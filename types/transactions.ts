export interface AffiliateTransaction {
    ab_transaction_id: string;
    person_id: {
        user_name: string;
        first_name: string;
        last_name: string;
    };
    affiliated_business_id: {
        affiliated_business_name: string;
    };
    product_id: {
        product_name: string;
    };
    currency: {
        currency_name: string;
        currency_exchange: number;
    };
    total_price: number;
    product_amount: number;
    transaction_code: string;
    state: string;
    created_at: string;
}

export interface TransactionFilters {
    searchTerm?: string;
    statusFilter?: string;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
}