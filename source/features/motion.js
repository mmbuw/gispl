export default function motion() {
    let motionApi = {},
        name = 'Motion';
    
    motionApi.name = function motionApi() {
        return name;
    };
    
    return motionApi;
}