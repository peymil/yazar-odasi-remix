
export default async function Layout() {
    return (
        <div>
            <h1>Sign In</h1>
            <form>
                <label>
                    Email
                    <input type="email" name="email"/>
                </label>
                <label>
                    Password
                    <input type="password" name="password"/>
                </label>
                <button type="submit">Sign In</button>
            </form>
        </div>
    )
}