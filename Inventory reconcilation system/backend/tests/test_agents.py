import pytest
from backend.app.agents.graph import workflow

def test_agent_graph_execution(db_session):
    # Execute the orchestrator run
    result = workflow.run(db_session)
    
    assert "run_id" in result
    assert "items_scanned" in result
    assert "mismatches" in result
    assert "root_causes" in result
    assert "compliance_score" in result
    assert "audit_trail" in result
    assert "logs" in result
    
    # Audit agent must write database records
    assert len(result["audit_trail"]) > 0
    assert result["compliance_score"] >= 0.0
