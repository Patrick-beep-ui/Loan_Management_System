import { useState, useEffect } from "react"
import api from "@/lib/axiosService"

export default function Test() {
    const [roles, setRoles] = useState([])

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.get("/roles")
                const { data } = response
                setRoles(data)
            }
            catch (error) {
                console.error("Error fetching roles:", error)
            }
        }

        fetchRoles()
    }, [])

    return(
        <section className="container">
            <h1>Test</h1>
          
                {roles.map((role) => (
                      <ul>
                        <li key={role.role_id}>{role.role_id}</li>
                        <li key={role.role_id}>{role.role_name}</li>
                    </ul>

                ))}
        </section>
    )
}