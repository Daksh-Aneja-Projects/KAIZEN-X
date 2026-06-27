import json
import os
import uuid
import random

# Fixed seed for deterministic generation
random.seed(42)

def generate_pack():
    pack = {
        "version": "1.0.0",
        "departments": [],
        "vendors": [],
        "applications": [],
        "projects": []
    }

    # 1. Departments (50)
    departments = []
    for i in range(50):
        dept_id = f"DEPT-{i:03d}"
        departments.append({
            "id": dept_id,
            "name": f"Department {i}",
            "type": "Department",
            "metadata": {},
            "dependencies": [],
            "headcount": random.randint(10, 500)
        })
    pack["departments"] = departments

    # 2. Vendors (100)
    # We explicitly create our flagship vendor
    vendors = [{
        "id": "VENDOR-GLOBALTECH",
        "name": "GlobalTech Supplies",
        "type": "Vendor",
        "metadata": {"criticality": "HIGH"},
        "dependencies": [],
        "risk_score": 0.1
    }]
    for i in range(1, 100):
        vendors.append({
            "id": f"VENDOR-{i:03d}",
            "name": f"Vendor {i}",
            "type": "Vendor",
            "metadata": {},
            "dependencies": [],
            "risk_score": random.uniform(0.1, 0.9)
        })
    pack["vendors"] = vendors

    # 3. Applications (500)
    apps = []
    for i in range(500):
        app_id = f"APP-{i:03d}"
        deps = []
        # Apps depend on departments
        deps.append({
            "target_id": random.choice(departments)["id"],
            "type": "OWNS",
            "weight": 1.0
        })
        # Some apps depend on vendors
        if random.random() > 0.7:
            target = "VENDOR-GLOBALTECH" if i < 10 else random.choice(vendors)["id"]
            deps.append({
                "target_id": target,
                "type": "DEPENDS_ON",
                "weight": random.uniform(1.0, 5.0)
            })

        apps.append({
            "id": app_id,
            "name": f"Application {i}",
            "type": "Application",
            "metadata": {},
            "dependencies": deps,
            "criticality": random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        })
    pack["applications"] = apps

    # 4. Projects (350)
    projects = []
    for i in range(350):
        proj_id = f"PROJ-{i:03d}"
        deps = []
        deps.append({
            "target_id": random.choice(departments)["id"],
            "type": "OWNS",
            "weight": 1.0
        })
        if random.random() > 0.5:
            deps.append({
                "target_id": random.choice(apps)["id"],
                "type": "SUPPORTS",
                "weight": 1.0
            })

        projects.append({
            "id": proj_id,
            "name": f"Project {i}",
            "type": "Project",
            "metadata": {},
            "dependencies": deps,
            "budget": random.uniform(10000, 1000000),
            "status": random.choice(["Planning", "Active", "On Hold"])
        })
    pack["projects"] = projects

    # Save to JSON
    os.makedirs(os.path.join(os.path.dirname(__file__), "../app/knowledge/enterprise"), exist_ok=True)
    with open(os.path.join(os.path.dirname(__file__), "../app/knowledge/enterprise/pack.json"), "w") as f:
        json.dump(pack, f, indent=2)

    print("Generated deterministic enterprise pack with ~1000 entities.")

if __name__ == "__main__":
    generate_pack()
