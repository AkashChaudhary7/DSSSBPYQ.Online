import fs from 'fs';
import path from 'path';

// Raw input strings array from the user prompt
const rawChunks = [
  // Chunk 1
  `[
  {
    "question": "Which topology requires a multipoint connection?",
    "options": [
      "A) Ring",
      "B) Bus",
      "C) Star",
      "D) Mesh"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "Which of the following maintains the Domain Name System?",
    "options": [
      "A) a single server",
      "B) a single computer",
      "C) distributed database system",
      "D) none of the mentioned"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "When discussing IDS/IPS, what is a signature?",
    "options": [
      "A) It refers to “normal,” baseline network behavior",
      "B) It is used to authorize the users on a network",
      "C) An electronic signature used to authenticate the identity of a user on the network",
      "D) Attack-definition file"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which of the following are Gigabit Ethernets?",
    "options": [
      "A) 1000 BASE-LX",
      "B) 1000 BASE-CX",
      "C) 1000 BASE-SX",
      "D) All of the mentioned"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which of the following networks extends a private network across public networks?",
    "options": [
      "A) virtual private network",
      "B) local area network",
      "C) storage area network",
      "D) enterprise private network"
    ],
    "correct_answer": "A",
    "explanation": ""
  },
  {
    "question": "Which layer is responsible for process to process delivery in a general network model?",
    "options": [
      "A) session layer",
      "B) data link layer",
      "C) transport layer",
      "D) network layer"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "What does each packet contain in a virtual circuit network?",
    "options": [
      "A) only source address",
      "B) only destination address",
      "C) full source and destination address",
      "D) a short VC number"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "What is the term for the data communication system within a building or campus?",
    "options": [
      "A) MAN",
      "B) LAN",
      "C) PAN",
      "D) WAN"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "What was the name of the first network?",
    "options": [
      "A) ASAPNET",
      "B) ARPANET",
      "C) CNNET",
      "D) NSFNET"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "Which of the following is the network layer protocol for the internet?",
    "options": [
      "A) hypertext transfer protocol",
      "B) file transfer protocol",
      "C) ethernet",
      "D) internet protocol"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which network topology requires a central controller or hub?",
    "options": [
      "A) Ring",
      "B) Bus",
      "C) Star",
      "D) Mesh"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "If a link transmits 4000 frames per second, and each slot has 8 bits, what is the transmission rate of the circuit using Time Division Multiplexing (TDM)?",
    "options": [
      "A) 500kbps",
      "B) 32kbps",
      "C) 32bps",
      "D) 500bps"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "Which of the following allows LAN users to share computer programs and data?",
    "options": [
      "A) File server",
      "B) Network",
      "C) Communication server",
      "D) Print server"
    ],
    "correct_answer": "A",
    "explanation": ""
  },
  {
    "question": "What type of transmission is involved in communication between a computer and a keyboard?",
    "options": [
      "A) Half-duplex",
      "B) Full-duplex",
      "C) Simplex",
      "D) Automatic"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "Which layer provides the services to user?",
    "options": [
      "A) physical layer",
      "B) presentation layer",
      "C) session layer",
      "D) application layer"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which connection is necessary for a computer to join the internet?",
    "options": [
      "A) internet society",
      "B) internet service provider",
      "C) different computer",
      "D) internet architecture board"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "Which of the following allows you to connect and login to a remote computer?",
    "options": [
      "A) SMTP",
      "B) HTTP",
      "C) FTP",
      "D) Telnet"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which of the following is used in an attempt to render a computer resource unavailable to its intended users?",
    "options": [
      "A) botnet process",
      "B) worms attack",
      "C) virus attack",
      "D) denial-of-service attack"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "What is a computer network?",
    "options": [
      "A) A device used to display information on a computer screen",
      "B) A collection of interconnected computers and devices that can communicate and share resources",
      "C) A type of software used to create documents and presentations",
      "D) The physical casing that protects a computer’s internal components"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "What is internet?",
    "options": [
      "A) A network of interconnected local area networks",
      "B) A collection of unrelated computers",
      "C) Interconnection of wide area networks",
      "D) A single network"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "Which of the following is an example of Bluetooth?",
    "options": [
      "A) wide area network",
      "B) virtual private network",
      "C) local area network",
      "D) personal area network"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which of the following computer networks is built on the top of another network?",
    "options": [
      "A) overlay network",
      "B) prime network",
      "C) prior network",
      "D) chief network"
    ],
    "correct_answer": "A",
    "explanation": ""
  },
  {
    "question": "What is the full form of OSI?",
    "options": [
      "A) optical service implementation",
      "B) open service Internet",
      "C) open system interconnection",
      "D) operating system interface"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "When a collection of various computers appears as a single coherent system to its clients, what is this called?",
    "options": [
      "A) mail system",
      "B) networking system",
      "C) computer network",
      "D) distributed system"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "How many layers are there in the ISO OSI reference model?",
    "options": [
      "A) 7",
      "B) 5",
      "C) 4",
      "D) 6"
    ],
    "correct_answer": "A",
    "explanation": ""
  },
  {
    "question": "What are nodes in a computer network?",
    "options": [
      "A) the computer that routes the data",
      "B) the computer that terminates the data",
      "C) the computer that originates the data",
      "D) all of the mentioned"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which one of the following is not a function of network layer?",
    "options": [
      "A) congestion control",
      "B) error control",
      "C) routing",
      "D) inter-networking"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "How is a single channel shared by multiple signals in a computer network?",
    "options": [
      "A) multiplexing",
      "B) phase modulation",
      "C) analog modulation",
      "D) digital modulation"
    ],
    "correct_answer": "A",
    "explanation": ""
  },
  {
    "question": "Which of the following devices forwards packets between networks by processing the routing information included in the packet?",
    "options": [
      "A) firewall",
      "B) bridge",
      "C) hub",
      "D) router"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "What is the term for an endpoint of an inter-process communication flow across a computer network?",
    "options": [
      "A) port",
      "B) machine",
      "C) socket",
      "D) pipe"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "How do two devices become part of a network?",
    "options": [
      "A) PIDs of the processes running of different devices are same",
      "B) a process in one device is able to exchange information with a process in another device",
      "C) a process is active and another is inactive",
      "D) a process is running on both devices"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "Which layer does the data link layer take packets from and encapsulate them into frames for transmission?",
    "options": [
      "A) transport layer",
      "B) application layer",
      "C) network layer",
      "D) physical layer"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "Which of this is not a network edge device?",
    "options": [
      "A) Switch",
      "B) PC",
      "C) Smartphones",
      "D) Servers"
    ],
    "correct_answer": "A",
    "explanation": ""
  },
  {
    "question": "Which type of network shares the communication channel among all the machines?",
    "options": [
      "A) anycast network",
      "B) multicast network",
      "C) unicast network",
      "D) broadcast network"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which topology requires a multipoint connection?",
    "options": [
      "A) Ring",
      "B) Bus",
      "C) Star",
      "D) Mesh"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "Which of the following maintains the Domain Name System?",
    "options": [
      "A) a single server",
      "B) a single computer",
      "C) distributed database system",
      "D) none of the mentioned"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "When discussing IDS/IPS, what is a signature?",
    "options": [
      "A) It refers to “normal,” baseline network behavior",
      "B) It is used to authorize the users on a network",
      "C) An electronic signature used to authenticate the identity of a user on the network",
      "D) Attack-definition file"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which of the following are Gigabit Ethernets?",
    "options": [
      "A) 1000 BASE-LX",
      "B) 1000 BASE-CX",
      "C) 1000 BASE-SX",
      "D) All of the mentioned"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which of the following networks extends a private network across public networks?",
    "options": [
      "A) virtual private network",
      "B) local area network",
      "C) storage area network",
      "D) enterprise private network"
    ],
    "correct_answer": "A",
    "explanation": ""
  },
  {
    "question": "Which layer is responsible for process to process delivery in a general network model?",
    "options": [
      "A) session layer",
      "B) data link layer",
      "C) transport layer",
      "D) network layer"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "What does each packet contain in a virtual circuit network?",
    "options": [
      "A) only source address",
      "B) only destination address",
      "C) full source and destination address",
      "D) a short VC number"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "What is the term for the data communication system within a building or campus?",
    "options": [
      "A) MAN",
      "B) LAN",
      "C) PAN",
      "D) WAN"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "What was the name of the first network?",
    "options": [
      "A) ASAPNET",
      "B) ARPANET",
      "C) CNNET",
      "D) NSFNET"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "Which of the following is the network layer protocol for the internet?",
    "options": [
      "A) hypertext transfer protocol",
      "B) file transfer protocol",
      "C) ethernet",
      "D) internet protocol"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which network topology requires a central controller or hub?",
    "options": [
      "A) Ring",
      "B) Bus",
      "C) Star",
      "D) Mesh"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "If a link transmits 4000 frames per second, and each slot has 8 bits, what is the transmission rate of the circuit using Time Division Multiplexing (TDM)?",
    "options": [
      "A) 500kbps",
      "B) 32kbps",
      "C) 32bps",
      "D) 500bps"
    ],
    "correct_answer": "B",
    "explanation": ""
  },
  {
    "question": "Which of the following allows LAN users to share computer programs and data?",
    "options": [
      "A) File server",
      "B) Network",
      "C) Communication server",
      "D) Print server"
    ],
    "correct_answer": "A",
    "explanation": ""
  },
  {
    "question": "What type of transmission is involved in communication between a computer and a keyboard?",
    "options": [
      "A) Half-duplex",
      "B) Full-duplex",
      "C) Simplex",
      "D) Automatic"
    ],
    "correct_answer": "C",
    "explanation": ""
  },
  {
    "question": "Which layer provides the services to user?",
    "options": [
      "A) physical layer",
      "B) presentation layer",
      "C) session layer",
      "D) application layer"
    ],
    "correct_answer": "D",
    "explanation": ""
  },
  {
    "question": "Which connection is necessary for a computer to join the internet?",
    "options": [
      "A) internet society",
      "B) internet service provider",
      "C) different computer",
      "D) internet architecture board"
    ],
    "correct_answer": "B",
    "explanation": ""
  }
]`
];

console.log('Done script created');
