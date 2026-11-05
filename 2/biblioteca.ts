type Genres =
  | "Fiction"
  | "Non-Fiction"
  | "Science Fiction"
  | "Fantasy"
  | "Classic"
  | "Action";

interface Book {
  title: string;
  author: string[] | string;
  isbn?: string;
  isAvailable: boolean;
  year: number;
  genres: Genres[];
  price: number;
  id: number;
}

interface Movies {
  title: string;
  director: string;
  actors: string[];
  isAvailable: boolean;
  year: number;
  genres: Genres[];
  rating: number;
}

const books: Book[] = [
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    isbn: "978-0547928227",
    isAvailable: true,
    year: 1937,
    genres: ["Fantasy"],
    price: 10.99,
    id: 1,
  },
  {
    title: "The Great Gatsby",
    author: ["F. Scott Fitzgerald", "Jeremias"],
    isbn: "978-0743273565",
    isAvailable: false,
    year: 1925,
    genres: ["Classic"],
    price: 9.99,
    id: 2,
  },
  {
    title: "Strange Old book",
    author: ["F. Scott Fitzgerald", "Jeremias"],
    isAvailable: true,
    year: 1925,
    genres: ["Classic", "Fantasy"],
    price: 14.99,
    id: 3,
  },
];

// 	Escribir una función listarDisponibles que reciba un array de libros y retorne solo los que están disponibles. Tipar explícitamente parámetros y valor de retorno.

function listarDisponibles(libros: Book[]): Book[] {
  return libros.filter((libro) => libro.isAvailable === true);
}

// Como ejecuto esto? "npx -y tsx biblioteca.ts" si me pide instalar algo, le doy que si
// console.log("Libros disponibles:", listarDisponibles(books));

// 	Escribir una función buscarPorId que pueda retornar un libro o undefined. Discutir: ¿qué pasa si usamos el resultado sin verificar si existe?

function buscarPorId(books: Book[], id: number): Book | undefined {
  return books.find((book) => book.id === id);
}
// console.log("Esto busca por ID 100:", buscarPorId(books, "100"));
// console.log("Esto busca por ID 2:", buscarPorId(books, 2));
