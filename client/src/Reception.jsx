import { useEffect, useState } from "react";
import { socket } from "./socket";
import { API_URL } from "./config";
export default function Reception() {
    const [queue, setQueue] = useState(null);
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    async function loadQueue() {
        const res = await fetch(`${API_URL}/queue`);
        const data = await res.json();
        setQueue(data);
    }

    async function addPatient() {
        const trimmed = name.trim();

        if (!trimmed) {
            setError("Please enter a patient name");
            return;
        }

        setError("");

        const res = await fetch(`${API_URL}/queue`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: trimmed }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Something went wrong");
            return;
        }

        setName("");
    }

    async function resetQueue() {
        await fetch(`${API_URL}/queue`, {
            method: "DELETE",
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
        <div className="page-grid">
            <section className="card card-form">
                <h2>Reception Panel</h2>
                <p className="muted">Add patients and manage the queue.</p>

                <div className="form-row">
                    <input
                        className="input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter patient name"
                    />
                    <button className="btn btn-primary" onClick={addPatient}>
                        Add Patient
                    </button>
                    <button className="btn btn-danger" onClick={resetQueue}>
                        Reset
                    </button>
                </div>

                {error && <p className="error-text">{error}</p>}
            </section>

            <section className="card">
                <h3>Current Patient</h3>
                <div className="patient-highlight">
                    {queue.current ? queue.current.name : "No patient now"}
                </div>
            </section>

            <section className="card">
                <h3>Waiting List</h3>
                {queue.waiting.length === 0 ? (
                    <p className="empty-text">No patients waiting</p>
                ) : (
                    <ul className="list">
                        {queue.waiting.map((patient, index) => (
                            <li key={patient.id} className="list-item">
                                <span>{index + 1}. {patient.name}</span>
                                <span className="badge">waiting</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="card">
                <h3>Completed</h3>
                {queue.done.length === 0 ? (
                    <p className="empty-text">No completed patients</p>
                ) : (
                    <ul className="list">
                        {queue.done.map((patient) => (
                            <li key={patient.id} className="list-item">
                                <span>{patient.name}</span>
                                <span className="badge done">done</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}