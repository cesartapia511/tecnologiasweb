SELECT c.id_carta, c.id_tutoria, t.id_modalidad, t.id_materia 
FROM cartas_designacion c 
JOIN tutorias t ON c.id_tutoria = t.id_tutoria 
ORDER BY c.id_carta DESC LIMIT 1;
