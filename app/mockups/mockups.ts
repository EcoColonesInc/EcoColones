
interface Product {
    id: number;
    imagen: string;
    titulo: string;
    descripcion: string;
    costo: number;
    state: boolean;
}

const mockProducts: Product[] = [
    {
        id: 1,
        imagen: '/mockImage.png',
        titulo: 'Crunchy Tacos',
        descripcion: 'Deliciosos tacos crujientes con carne y vegetales frescos',
        costo: 250,
        state: false
    },
    {
        id: 2,
        imagen: '/mockImage.png',
        titulo: 'Burrito Vegano',
        descripcion: 'Burrito relleno de frijoles, arroz y vegetales orgánicos',
        costo: 350,
        state: true
    },
    {
        id: 3,
        imagen: '/mockImage.png',
        titulo: 'Ensalada Verde',
        descripcion: 'Mezcla de lechugas frescas con aderezo de la casa',
        costo: 200,
        state: true
    },
    {
        id: 4,
        imagen: '/mockImage.png',
        titulo: 'Smoothie Tropical',
        descripcion: 'Batido natural de frutas tropicales y miel',
        costo: 180,
        state: true
    },
    {
        id: 5,
        imagen: '/mockImage.png',
        titulo: 'Wrap de Pollo',
        descripcion: 'Tortilla integral con pollo a la parrilla y vegetales',
        costo: 300,
        state: true
    },
    {
        id: 6,
        imagen: '/mockImage.png',
        titulo: 'Bowl Saludable',
        descripcion: 'Bowl con quinoa, aguacate, tomate y proteína de tu elección',
        costo: 400,
        state: true
    },
    {
        id: 7,
        imagen: '/mockImage.png',
        titulo: 'Bowl Saludable',
        descripcion: 'Bowl con quinoa, aguacate, tomate y proteína de tu elección',
        costo: 400,
        state: true
    },
    {
        id: 8,
        imagen: '/mockImage.png',
        titulo: 'Quesadilla de Queso',
        descripcion: 'Quesadilla con mezcla de quesos fundidos y jalapeños',
        costo: 280,
        state: true
    },
    {
        id: 9,
        imagen: '/mockImage.png',
        titulo: 'Nachos Supreme',
        descripcion: 'Nachos crujientes con queso, guacamole y crema',
        costo: 320,
        state: true
    },
    {
        id: 10,
        imagen: '/mockImage.png',
        titulo: 'Jugo Natural',
        descripcion: 'Jugo recién exprimido de naranja o zanahoria',
        costo: 150,
        state: true
    },
    {
        id: 11,
        imagen: '/mockImage.png',
        titulo: 'Tostadas de Aguacate',
        descripcion: 'Pan tostado con aguacate fresco, tomate y semillas',
        costo: 270,
        state: true
    } ];


    
    interface Transaction {
        transactionID: string;
        user: string;
        product: string;
        quantity: number;
        date: string;
        amount: string;
        status: 'Completado' | 'Pendiente' | 'Cancelado';
        [key : string]: string | number;
    }

const mockTransactions: Transaction[] = [
        {
            transactionID: 'TXN123456',
            user: 'Maria Lopez',
            product: 'Crunchy Tacos',
            quantity: 10,
            date: '2024-06-15',
            amount: '2500',
            status: 'Completado',
        },
        {
            transactionID: 'TXN123456',
            user: 'Maria Lopez',
            product: 'Crunchy Tacos',
            quantity: 10,
            date: '2024-06-15',
            amount: '2500',
            status: 'Pendiente',
        },
        {
            transactionID: 'TXN123456',
            user: 'Maria Lopez',
            product: 'Crunchy Tacos',
            quantity: 10,
            date: '2024-06-15',
            amount: '2500',
            status: 'Cancelado',
        }
        
    ];

    
const mockaffiliate = {
    id: 1,
    name: 'Taco Bell - Belen',
    direccion: '123 Affiliate St, City, Country',
    telefono: '123-456-7890',
    email: 'affiliate@example.com'
};

export { mockaffiliate, mockProducts, mockTransactions };