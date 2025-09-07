import { z } from 'zod';
export declare const posts: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "posts";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "posts";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        title: import("drizzle-orm/pg-core").PgColumn<{
            name: "title";
            tableName: "posts";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        content: import("drizzle-orm/pg-core").PgColumn<{
            name: "content";
            tableName: "posts";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        authorId: import("drizzle-orm/pg-core").PgColumn<{
            name: "author_id";
            tableName: "posts";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "posts";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "posts";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertPostSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    authorId: z.ZodString;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}, {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}>;
export declare const selectPostSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    authorId: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    content: string;
    authorId: string;
}, {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    content: string;
    authorId: string;
}>;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
//# sourceMappingURL=posts.d.ts.map