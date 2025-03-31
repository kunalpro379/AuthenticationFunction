import axios from 'axios';
import qs from 'qs';
const GITHUB_OAUTH_CLIENT_ID= process.env.GITHUB_OAUTH_CLIENT_ID as unknown as string;
const GITHUB_OAUTH_CLIENT_SECRET= process.env.GITHUB_OAUTH_CLIENT_SECRET as unknown as string;

type GithubOauthToken={
    access_token: string;
}
export const getGithubOauthToken=async({
    code
}:{
    code:string
}): Promise<GithubOauthToken>=>{
    const rootUrl="https://github.com/login/oauth/access_token";
    const options={
        client_id:GITHUB_OAUTH_CLIENT_ID,
        client_secret:GITHUB_OAUTH_CLIENT_SECRET,
        code,
    };
    const queryString=qs.stringify(options);
    try{
        const {data}=await axios.post(`${rootUrl}?${queryString}`,{
            headers:{
                "Content-Type":"application/x-www-form-urlencoded"
            }
        });
        const decoded=qs.parse(data) as GithubOauthToken;
        return decoded;

    }catch(err){
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            throw new Error(String(err));
        }
    };
};
interface GitHubUser{
    login: string;
    avatar_url: string;
    name: string;
    email: string | null; // Update to accept null since GitHub may not return email
}
export const getGithubUser=async({
    access_token,
}: {
    access_token:string;
}):Promise<GitHubUser>=>{
    try{
        // First get the user profile
        const {data} = await axios.get(
            "https://api.github.com/user",
            {
                headers:{
                    Authorization: `Bearer ${access_token}`
                }
            }
        );

        // If email isn't in the basic profile, try to get email from emails endpoint
        if (!data.email) {
            try {
                const emailResponse = await axios.get(
                    "https://api.github.com/user/emails",
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`
                        }
                    }
                );
                
                // Find primary email or take the first one
                const primaryEmail = emailResponse.data.find((email: any) => email.primary) || emailResponse.data[0];
                if (primaryEmail && primaryEmail.email) {
                    data.email = primaryEmail.email;
                }
            } catch (err) {
                console.log("Could not fetch user emails from GitHub");
            }
        }
        
        return data;
    }catch(error: any){
        throw new Error(error.message);
    }
}