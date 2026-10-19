"use client";

import { useMemo, useState } from "react";
import styles from "./calculator.module.css";

const initial = { inquiries: "", conversion: "", treatmentValue: "", capacity: "", currency: "USD", scenario: 0 };

function money(value: number, currency: string) {
  return new Intl.NumberFormat("es", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

function Info({ children, label }: { children: React.ReactNode; label: string }) {
  return <details className={styles.info}><summary aria-label={label}>i</summary><p>{children}</p></details>;
}

export function Calculator() {
  const [values, setValues] = useState(initial);
  const completedInputs = [values.inquiries, values.conversion, values.treatmentValue, values.capacity].filter((value) => value !== "").length;
  const ready = completedInputs === 4;
  const result = useMemo(() => {
    const inquiries = Math.max(0, Number(values.inquiries) || 0);
    const conversion = Math.min(100, Math.max(0, Number(values.conversion) || 0)) / 100;
    const treatmentValue = Math.max(0, Number(values.treatmentValue) || 0);
    const capacity = Math.max(0, Number(values.capacity) || 0);
    const baselinePatients = inquiries * conversion;
    const extraPatients = Math.min(inquiries * (values.scenario / 100) * conversion, capacity);
    const baselineValue = baselinePatients * treatmentValue;
    const extraValue = extraPatients * treatmentValue;
    const factor = baselineValue > 0 ? (baselineValue + extraValue) / baselineValue : null;
    return { inquiries, capacity, baselinePatients, extraPatients, baselineValue, extraValue, futureValue: baselineValue + extraValue, factor };
  }, [values]);

  function change(key: keyof typeof initial, value: string | number) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className={styles.calculator} aria-label="Calculadora interactiva de escenarios">
      <div className={styles.inputs}>
        <div className={styles.panelHead}><span className={styles.panelIndex}>01</span><div><small>PRIMERO, TU CLÍNICA</small><h2>Cuéntanos cómo te va hoy.</h2></div></div>
        <div className={styles.inputProgress}><span><i style={{ width: `${completedInputs * 25}%` }} /></span><small>{completedInputs === 4 ? "¡Listo! Ya tenemos tu punto de partida." : `${completedInputs} de 4 datos · vamos paso a paso`}</small></div>
        <div className={styles.field}><div className={styles.fieldLabelRow}><label htmlFor="inquiries">¿Cuántas consultas nuevas recibes por internet al mes?</label><Info label="Más información sobre consultas nuevas">Cuenta las personas que llegan por tu web, Google o redes y preguntan por tus servicios.</Info></div><small>Usa un promedio mensual.</small><input id="inquiries" type="number" min="0" step="1" inputMode="numeric" placeholder="Por ejemplo, 20" value={values.inquiries} onChange={(event) => change("inquiries", event.currentTarget.value)} /></div>
        <div className={styles.field}><div className={styles.fieldLabelRow}><label htmlFor="conversion">De cada 100 personas que preguntan, ¿cuántas agendan?</label><Info label="Más información sobre personas que agendan">Escribe un porcentaje aproximado. Por ejemplo, si agendan 30 personas, escribe 30.</Info></div><small>Un estimado está bien.</small><div className={styles.inputSuffix}><input id="conversion" type="number" min="0" max="100" step="1" inputMode="numeric" placeholder="Por ejemplo, 30" value={values.conversion} onChange={(event) => change("conversion", event.currentTarget.value)} /><i>%</i></div></div>
        <div className={styles.field}><div className={styles.fieldLabelRow}><label htmlFor="treatment-value">¿Cuánto suele pagar un paciente nuevo?</label><Info label="Más información sobre el valor del tratamiento">Usa el valor promedio de su primer tratamiento, antes de restar gastos.</Info></div><small>Elige la moneda de tu clínica.</small><div className={styles.valueRow}><select aria-label="Moneda" value={values.currency} onChange={(event) => change("currency", event.currentTarget.value)}><option>USD</option><option>MXN</option><option>CLP</option><option>PEN</option><option>COP</option><option>CRC</option></select><input id="treatment-value" aria-label="Valor promedio del primer tratamiento" type="number" min="0" step="50" inputMode="decimal" placeholder="Por ejemplo, 500" value={values.treatmentValue} onChange={(event) => change("treatmentValue", event.currentTarget.value)} /></div></div>
        <div className={styles.field}><div className={styles.fieldLabelRow}><label htmlFor="capacity">¿A cuántos pacientes nuevos más podrías atender al mes?</label><Info label="Más información sobre cupos disponibles">Piensa en el espacio real de tu agenda y de tu equipo para recibir pacientes adicionales.</Info></div><small>Considera tus horarios y capacidad actuales.</small><input id="capacity" type="number" min="0" step="1" inputMode="numeric" placeholder="Por ejemplo, 8" value={values.capacity} onChange={(event) => change("capacity", event.currentTarget.value)} /></div>
      </div>

      <div className={styles.scenarioPanel}>
        <div className={styles.panelHead}><span className={styles.panelIndex}>02</span><div><small>AHORA, PRUEBA UNA IDEA</small><h2>¿Y si recibieras más consultas?</h2></div></div>
        <div className={styles.rangeLabel}><label htmlFor="scenario-range">¿Cuánto te gustaría aumentarlas?</label><Info label="Más información sobre el escenario">Tú eliges el aumento para ver qué pasaría en esta simulación. No es una promesa ni un pronóstico de Elevator Web.</Info><strong>+{values.scenario}%</strong></div>
        <div className={styles.scenarioChoices} aria-label="Elige un aumento para explorar">
          {[25, 50, 100, 200].map((scenario) => <button key={scenario} type="button" className={values.scenario === scenario ? styles.activeChoice : ""} aria-pressed={values.scenario === scenario} onClick={() => change("scenario", scenario)}>+{scenario}%</button>)}
        </div>
        <input className={styles.range} id="scenario-range" type="range" min="0" max="200" step="5" value={values.scenario} onChange={(event) => change("scenario", Number(event.currentTarget.value))} />
        <div className={styles.rangeBounds}><span>Sin cambio</span><span>+200%</span></div>
        <p className={styles.assumption}>Mueve la barra para comparar posibilidades. Usa el aumento que te gustaría explorar.</p>

        <div className={`${styles.resultCard} ${ready ? styles.resultReady : ""}`} aria-live="polite">
          <small>{ready ? "TU ESCENARIO DEL MES" : "TU RESULTADO APARECERÁ AQUÍ"}</small>
          <strong>{ready ? money(result.extraValue, values.currency) : "Vamos a calcularlo"}</strong>
          <span>{ready ? "ingreso bruto adicional hipotético" : "Completa tus 4 datos para ver el resultado con tus promedios."}</span>
          {ready ? <div className={styles.comparison} aria-label="Comparación de ingreso bruto actual y escenario elegido">
            <div className={styles.comparisonLegend}><span><i /> Hoy {money(result.baselineValue, values.currency)}</span><span><i /> Con este escenario {money(result.futureValue, values.currency)}</span></div>
            <div className={styles.barTrack}><i style={{ width: `${result.futureValue > 0 ? result.baselineValue / result.futureValue * 100 : 0}%` }} /></div>
            <div className={styles.barTrack}><i className={styles.futureBar} style={{ width: `${result.futureValue > 0 ? 100 : 0}%` }} /></div>
          </div> : null}
          <div className={styles.resultDivider} />
          <div className={styles.metrics}><span><b>{ready ? result.extraPatients.toFixed(1) : "—"}</b> pacientes nuevos posibles</span><span><b>{ready && result.factor ? `${result.factor.toFixed(2)}×` : "—"}</b> comparado con hoy</span></div>
          {ready && result.extraPatients >= result.capacity && result.capacity > 0 ? <p className={styles.baselineHint}>Tu capacidad disponible limita este escenario. Si pudieras atender a más personas, el resultado cambiaría.</p> : null}
          <small className={styles.formula}>La cuenta usa tus respuestas y respeta el número de pacientes que puedes atender.</small>
        </div>
        <p className={styles.disclaimer}>Es solo un ejercicio con los datos que ingresaste. No predice resultados y tus respuestas no se guardan ni se envían.</p>
      </div>
    </section>
  );
}
