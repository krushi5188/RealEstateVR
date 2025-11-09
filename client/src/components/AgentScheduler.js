import React, { useState } from 'react';
import './AgentScheduler.css';

export default function AgentScheduler({ onScheduleRun }) {
  const [tasks, setTasks] = useState([
    { id: 1, agent: 'Person 1', action: 'Go to Kitchen' },
    { id: 2, agent: 'Person 1', action: 'Go to Office' },
  ]);
  const [nextId, setNextId] = useState(3);

  const handleAddTask = () => {
    setTasks([...tasks, { id: nextId, agent: 'Person 1', action: 'New Task' }]);
    setNextId(nextId + 1);
  };

  const handleRemoveTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleRun = () => {
    // In a real implementation, this would pass the structured tasks.
    // For now, it just signals to run a pre-defined schedule.
    onScheduleRun();
  };

  return (
    <div className="agent-scheduler">
      <h4>"Day in the Life" Simulation</h4>
      <div className="task-list">
        {tasks.map((task, index) => (
          <div key={task.id} className="task-item">
            <span>{index + 1}.</span>
            <input type="text" defaultValue={task.agent} className="task-input" />
            <input type="text" defaultValue={task.action} className="task-input" />
            <button onClick={() => handleRemoveTask(task.id)} className="remove-btn">×</button>
          </div>
        ))}
      </div>
      <div className="scheduler-actions">
        <button onClick={handleAddTask} className="add-task-btn">+ Add Task</button>
        <button onClick={handleRun} className="run-sim-btn">Run Simulation</button>
      </div>
    </div>
  );
}
