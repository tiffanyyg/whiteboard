## Design 

## Targets

### Overall Design: 
- Present a complete, and clear Architecture for your Private Cloud, that you designed and deployed.
- The design must support Consistency & Scalability and proposes measures for low latency or fault tolerance
- Each component’s purpose is justified theoretically

### Network Topology and Communication
(Network topology is about how data flows throughout our solution)
Include a network-topology diagram showing:
- - how clients connect to your cloud (entry point / public interface);
- - how traffic flows through load balancer / ingress;
- - internal connections between service instances (pods / containers / VMs);
- - shared storage or state service links.
- Label all links and protocols (HTTP, WebSocket, Redis pub/sub, etc.).
- Explain how your topology minimises latency (e.g., single-region, short hops, internal bridge network).

