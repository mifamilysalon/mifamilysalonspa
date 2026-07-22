UPDATE users SET password_hash = 'pbkdf2$25000$J4FdxaOUdIjh7ZType/gPA==$A27ajkizGoYw826sP0OsUjlBftN8LPTb33/aoMdWhAk=' WHERE id = 1;
UPDATE users SET pin_hash = 'pbkdf2$25000$/W16Vuzsw6W7c+Vyn7WZzg==$yJhdH5IrVeeajeAymfABLb3EZc0F9MIOy2jK9xlIlC8=' WHERE id IN (2, 3);
