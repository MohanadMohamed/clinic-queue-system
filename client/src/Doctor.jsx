import { useEffect, useState } from "react";
import { socket } from "./socket";
import { API_URL } from "./config";
export default function Doctor() {
    const [queue, setQueue] = useState(null);

    async function loadQueue() {
        const res = await fetch(`${API_URL}/queue`);
        const data = await res.json();
        setQueue(data);
    }

    async function nextPatient() {
        await fetch(`${API_URL}/queue/next`, {
            method: "POST",
        });
    }

    useEffect(() => {
        loadQueue();

        socket.on("queueUpdated", (state) => {
            setQueue(state);
        });

        return () => {
            socket.off("queueUpdated");
        };
    }, []);

    if (!queue) return <div className="loading">Loading...</div>;

    return (
        <div className="doctor-layout">
            <section className="card doctor-main">
                <h2>Doctor Panel</h2>
                <p className="muted">Current patient in session</p>

                <div className="patient-big">
                    {queue.current ? queue.current.name : "No patient now"}
                </div>

                <button className="btn btn-primary btn-large" onClick={nextPatient}>
                    Next Patient
                </button>
            </section>

            <section className="card">
                <h3>Next in Line</h3>
                <div className="patient-highlight small">
                    {queue.waiting[0] ? queue.waiting[0].name : "No one waiting"}
                </div>
            </section>
        </div>
    );
}