# Carta de designación de tutor

Documento que el sistema muestra en la ventana «Carta de Designación» de la pantalla de tutorías y que se puede imprimir con el botón **Imprimir Carta**. Los datos provienen de `CartaDesignacionModel` (tabla `cartas_designacion` unida con tutorías, materias, estudiantes y tutores).

## Contenido

```
[Logo UPDS]
UNIVERSIDAD PRIVADA DOMINGO SAVIO
CARTA DE DESIGNACIÓN DE TUTOR

                                              Tarija, {fecha_generacion}

Señor(a):
Lic. {tutor_nombre} {tutor_apellido}
Presente.-

De mi mayor consideración:

Mediante la presente, tengo a bien comunicarle que ha sido designado(a)
como Tutor(a) del(la) estudiante {estudiante_nombre} {estudiante_apellido},
quien se encuentra desarrollando la modalidad de graduación
{nombre_modalidad}.

Agradecemos su compromiso con la excelencia académica y le deseamos el
mayor de los éxitos en el acompañamiento de este proceso.

                    ______________________________
                    Firma y Sello de Coordinación
```

## Campos

| Campo | Origen |
|---|---|
| `fecha_generacion` | Fecha en que se generó la carta; se muestra en formato largo (día, mes y año) |
| `tutor_nombre`, `tutor_apellido` | Usuario del tutor designado |
| `estudiante_nombre`, `estudiante_apellido` | Usuario del estudiante |
| `nombre_modalidad` | Modalidad de graduación elegida al generar la carta; si no hay dato se muestra «Proyecto de Grado» |

## Estado de la carta

La carta lleva su estado (`pendiente`, `aceptada` o `rechazada`), la fecha de firma y, si fue rechazada, el motivo. Estos datos se ven en el listado de cartas de la pantalla de tutorías. Ver [estados-tutoria.md](estados-tutoria.md).
