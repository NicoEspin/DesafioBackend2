import { promises as fs } from 'fs';

class ProductManager {
    constructor(path) {
        this.path = path;
        this.products = [];
    }

    async readProducts() {
        try {
            const fileContents = await fs.readFile(this.path, 'utf-8');
            this.products = JSON.parse(fileContents);
        } catch (error) {
            this.products = [];
        }
    }

    async saveProducts() {
        await fs.writeFile(this.path, JSON.stringify(this.products, null, 2), 'utf-8');
    }

    async addProduct(product) {
        await this.readProducts();

        const requiredFields = ['title', 'description', 'price', 'thumbnail', 'code', 'stock'];
        const missingFields = requiredFields.filter(field => !(field in product));

        if (missingFields.length > 0) {
            console.log(`Campos requeridos faltantes en el producto: ${missingFields.join(', ')}`);
            return;
        }

        const isCodeRepeated = this.products.some(existingProduct => existingProduct.code === product.code);
        if (isCodeRepeated) {
            console.log("Ya existe un producto con este código");
            return;
        }

        const newProduct = {
            ...product,
            id: Product.idGenerate(),
        };
        this.products.push(newProduct);
        await this.saveProducts();
    }

    async getProducts() {
        await this.readProducts();
        return this.products;
    }

    async getProductById(id) {
        await this.readProducts();
        return this.products.find(product => product.id === id);
    }

    async updateProduct(id, updatedFields) {
        await this.readProducts();
        const productIndex = this.products.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            this.products[productIndex] = {
                ...this.products[productIndex],
                ...updatedFields,
            };
            await this.saveProducts();
        }
    }

    async deleteProduct(id) {
        await this.readProducts();
        this.products = this.products.filter(product => product.id !== id);
        await this.saveProducts();
    }
}

class Product {
    constructor(title, description, price, thumbnail, code, stock) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.code = code;
        this.stock = stock;
    }

    static idGenerate() {
        if (!this.idIncrement) {
            this.idIncrement = 1;
        } else {
            this.idIncrement++;
        }
        return this.idIncrement;
    }
}

const productManager = new ProductManager('./productos.json');

const prod1 = new Product("Leche", "Leche descremada", 250, "imagen1.jpg", "ASDF12", 115);
const prod2 = new Product("Cafe", "Café tostado", 1500, "imagen2.jpg", "BVCD15", 120);
const prod3 = new Product("Té", "Té de hierbas", 160, "imagen3.jpg", "BVSB16", 100);

(async () => {
    await productManager.addProduct(prod1);
    await productManager.addProduct(prod2);
    await productManager.addProduct(prod3);

    const products = await productManager.getProducts();
    console.log(products);

    const foundProductByCode = await productManager.getProductByCode("BVCD15");
    console.log(foundProductByCode);

    const foundProductById = await productManager.getProductById(2);
    console.log(foundProductById);

    await productManager.updateProduct(2, { price: 1600 });
    const updatedProduct = await productManager.getProductById(2);
    console.log(updatedProduct);

    await productManager.deleteProduct(1);
    const remainingProducts = await productManager.getProducts();
    console.log(remainingProducts);
})();