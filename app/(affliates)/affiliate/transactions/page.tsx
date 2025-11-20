import { TransactionManager } from "@/components/custom/affiliate/transactionManager";
import { getUserBusinessTransactions } from "@/lib/api/transactions";



export default async function transactions() {

    //const allTranstactions = await getUserBusinessTransactions();
    //console.log('All Transactions:', allTranstactions);

    const mockTransactions = [
        {
            ab_transaction_id: "1",
            person_id: {
                user_name: "maria_lopez",
                first_name: "María",
                last_name: "López"
            },
            affiliated_business_id: {
                affiliated_business_name: "Taco Bell - Belén"
            },
            product_id: {
                product_name: "Crunchy Tacos"
            },
            currency: {
                currency_name: "CRC",
                currency_exchange: 1
            },
            total_price: 2500,
            product_amount: 2,
            transaction_code: "TCO2024001",
            state: "active",
            created_at: "2024-11-20T10:30:00Z"
        },
        {
            ab_transaction_id: "2",
            person_id: {
                user_name: "carlos_ruiz",
                first_name: "Carlos",
                last_name: "Ruiz"
            },
            affiliated_business_id: {
                affiliated_business_name: "Taco Bell - Belén"
            },
            product_id: {
                product_name: "Burrito Vegano"
            },
            currency: {
                currency_name: "CRC",
                currency_exchange: 1
            },
            total_price: 1750,
            product_amount: 1,
            transaction_code: "TCO2024002",
            state: "cancelled",
            created_at: "2024-11-20T09:15:00Z"
        },
        {
            ab_transaction_id: "3",
            person_id: {
                user_name: "ana_garcia",
                first_name: "Ana",
                last_name: "García"
            },
            affiliated_business_id: {
                affiliated_business_name: "Taco Bell - Belén"
            },
            product_id: {
                product_name: "Smoothie Tropical"
            },
            currency: {
                currency_name: "CRC",
                currency_exchange: 1
            },
            total_price: 900,
            product_amount: 3,
            transaction_code: "TCO2024003",
            state: "inactive",
            created_at: "2024-11-19T14:45:00Z"
        },
        {
            ab_transaction_id: "4",
            person_id: {
                user_name: "luis_mendez",
                first_name: "Luis",
                last_name: "Méndez"
            },
            affiliated_business_id: {
                affiliated_business_name: "Taco Bell - Belén"
            },
            product_id: {
                product_name: "Ensalada Verde"
            },
            currency: {
                currency_name: "CRC",
                currency_exchange: 1
            },
            total_price: 1200,
            product_amount: 2,
            transaction_code: "TCO2024004",
            state: "active",
            created_at: "2024-11-19T11:20:00Z"
        },
        {
            ab_transaction_id: "5",
            person_id: {
                user_name: "sofia_jimenez",
                first_name: "Sofía",
                last_name: "Jiménez"
            },
            affiliated_business_id: {
                affiliated_business_name: "Taco Bell - Belén"
            },
            product_id: {
                product_name: "Bowl Saludable"
            },
            currency: {
                currency_name: "USD",
                currency_exchange: 0.0018
            },
            total_price: 4200,
            product_amount: 1,
            transaction_code: "TCO2024005",
            state: "active",
            created_at: "2024-11-18T16:30:00Z"
        },
        {
            ab_transaction_id: "6",
            person_id: {
                user_name: "diego_vargas",
                first_name: "Diego",
                last_name: "Vargas"
            },
            affiliated_business_id: {
                affiliated_business_name: "Taco Bell - Belén"
            },
            product_id: {
                product_name: "Wrap de Pollo"
            },
            currency: {
                currency_name: "CRC",
                currency_exchange: 1
            },
            total_price: 3600,
            product_amount: 4,
            transaction_code: "TCO2024006",
            state: "active",
            created_at: "2024-11-18T13:15:00Z"
        },
        {
            ab_transaction_id: "7",
            person_id: {
                user_name: "paula_castro",
                first_name: "Paula",
                last_name: "Castro"
            },
            affiliated_business_id: {
                affiliated_business_name: "Taco Bell - Belén"
            },
            product_id: {
                product_name: "Crunchy Tacos"
            },
            currency: {
                currency_name: "CRC",
                currency_exchange: 1
            },
            total_price: 1250,
            product_amount: 1,
            transaction_code: "TCO2024007",
            state: "cancelled",
            created_at: "2024-11-17T12:00:00Z"
        },
        {
            ab_transaction_id: "8",
            person_id: {
                user_name: "roberto_solis",
                first_name: "Roberto",
                last_name: "Solís"
            },
            affiliated_business_id: {
                affiliated_business_name: "Taco Bell - Belén"
            },
            product_id: {
                product_name: "Smoothie Tropical"
            },
            currency: {
                currency_name: "CRC",
                currency_exchange: 1
            },
            total_price: 540,
            product_amount: 2,
            transaction_code: "TCO2024008",
            state: "inactive",
            created_at: "2024-11-17T08:45:00Z"
        },
        {
            ab_transaction_id: "9",
            person_id: {
                user_name: "elena_morales",
                first_name: "Elena",
                last_name: "Morales"
            },
            affiliated_business_id: {
                affiliated_business_name: "Taco Bell - Belén"
            },
            product_id: {
                product_name: "Bowl Saludable"
            },
            currency: {
                currency_name: "CRC",
                currency_exchange: 1
            },
            total_price: 2800,
            product_amount: 2,
            transaction_code: "TCO2024009",
            state: "active",
            created_at: "2024-11-16T15:30:00Z"
        },
        {
            ab_transaction_id: "10",
            person_id: {
                user_name: "fernando_vega",
                first_name: "Fernando",
                last_name: "Vega"
            },
            affiliated_business_id: {
                affiliated_business_name: "Taco Bell - Belén"
            },
            product_id: {
                product_name: "Burrito Vegano"
            },
            currency: {
                currency_name: "USD",
                currency_exchange: 0.0018
            },
            total_price: 5250,
            product_amount: 3,
            transaction_code: "TCO2024010",
            state: "active",
            created_at: "2024-11-16T10:15:00Z"
        }
    ]; 
    
    return (
        <div className="container mx-auto px-4 mb-20">
            <div className="pt-8 mb-5">
                <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
                <p className="text-gray-600 mt-1">
                    Gestiona y revisa todas las transacciones de tu negocio
                </p>
            </div>
            <div>
             <TransactionManager
                initialTransactions={mockTransactions || []}
                errMsg={''}
               />
            </div>
            
        </div>
    );
}