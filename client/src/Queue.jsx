import { useEffect, useState } from "react";
import { socket } from "./socket";

export default function Queue() {
    const [queue, setQueue] = useState(null);

    async function loadQueue() {
        const res = await fetch("http://localhost:4000/queue");
        const data = await res.json();
        setQueue(data);
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
        <div className="queue-screen">
            <section className="card queue-main-card">
                <h2>Now Serving</h2>
                <div className="queue-current">
                    {queue.current ? queue.current.name : "Waiting for next patient"}
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
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}