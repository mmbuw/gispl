export default function motion() {
    let motionApi = {},
        type = 'Motion';
    
    motionApi.type = function motionApi() {
        return type;
    };
    
    return motionApi;
}